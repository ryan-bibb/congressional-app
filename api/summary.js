const {aqiLabels} = require("./_lib/aqi");

const nearbyRadiusMiles = 20;

function distanceAndDirection(from, to) {
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const north = toRadians(to.lat - from.lat);
    const east = toRadians(to.lon - from.lon) * Math.cos(toRadians((from.lat + to.lat) / 2));
    const miles = 3959 * Math.hypot(north, east);
    const direction = Math.abs(north) >= Math.abs(east) ? (north > 0 ? "north" : "south") : (east > 0 ? "east" : "west");
    return {miles, direction};
}

async function getNearbyAirQuality(coord, apiKey) {
    const findResponse = await fetch(`https://api.openweathermap.org/data/2.5/find?lat=${coord.lat}&lon=${coord.lon}&cnt=50&appid=${apiKey}`);
    if (!findResponse.ok) {
        return [];
    }
    const found = await findResponse.json();

    const farthestByDirection = {};
    for (const place of found.list) {
        const {miles, direction} = distanceAndDirection(coord, place.coord);
        if (miles < 3 || miles > nearbyRadiusMiles) {
            continue;
        }
        if (!farthestByDirection[direction] || miles > farthestByDirection[direction].miles) {
            farthestByDirection[direction] = {name: place.name, coord: place.coord, miles, direction};
        }
    }

    const nearby = await Promise.all(Object.values(farthestByDirection).map(async (place) => {
        const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${place.coord.lat}&lon=${place.coord.lon}&appid=${apiKey}`);
        if (!airResponse.ok) {
            return null;
        }
        const air = await airResponse.json();
        return {
            city: place.name,
            direction: place.direction,
            miles: Math.round(place.miles),
            airQuality: aqiLabels[air.list[0].main.aqi],
        };
    }));
    return nearby.filter(Boolean);
}

module.exports = async (req, res) => {
    const {city} = req.query;
    if (!city) {
        return res.status(400).json({error: "Missing city"});
    }
    const {WEATHER_API_KEY, GROQ_API_KEY} = process.env;

    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=imperial`);
    if (!weatherResponse.ok) {
        return res.status(weatherResponse.status).json({error: "Can't find that city"});
    }
    const weather = await weatherResponse.json();

    const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${WEATHER_API_KEY}`);
    if (!airResponse.ok) {
        return res.status(airResponse.status).json({error: "Couldn't get air quality"});
    }
    const air = await airResponse.json();
    const nearby = await getNearbyAirQuality(weather.coord, WEATHER_API_KEY).catch(() => []);

    const conditions = {
        city: `${weather.name}, ${weather.sys.country}`,
        temperatureF: Math.round(weather.main.temp),
        feelsLikeF: Math.round(weather.main.feels_like),
        description: weather.weather[0].description,
        humidity: weather.main.humidity,
        windMph: weather.wind.speed,
        airQuality: aqiLabels[air.list[0].main.aqi],
        pollutants: air.list[0].components,
        nearby,
    };

    const summary = await getAiSummary(conditions, GROQ_API_KEY).catch(() => basicSummary(conditions));

    res.json({city: conditions.city, summary, nearby});
};

async function getAiSummary(conditions, apiKey) {
    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY");
    }
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            reasoning_effort: "low",
            messages: [
                {
                    role: "system",
                    content: "You give short, friendly advice based on current weather and air quality. In 3-5 plain-text sentences (no markdown), summarize the conditions and tell the user how to react: what to wear, whether to bring an umbrella or sunscreen, and whether outdoor activity is a good idea given the air quality. Mention extra precautions for sensitive groups if air quality is moderate or worse. The \"nearby\" list has air quality for nearby cities (with direction and distance in miles); if any of them have poor or very poor air quality, warn the user by name and direction. Only mention nearby cities from that list, and say nothing about them if none are poor.",
                },
                {role: "user", content: JSON.stringify(conditions)},
            ],
        }),
    });
    if (!aiResponse.ok) {
        throw new Error("Couldn't get AI summary");
    }
    const ai = await aiResponse.json();
    const content = ai.choices[0].message.content;
    if (!content) {
        throw new Error("Empty AI summary");
    }
    return content.trim();
}

function basicSummary(conditions) {
    return `It's ${conditions.temperatureF}°F (feels like ${conditions.feelsLikeF}°F) with ${conditions.description} in ${conditions.city}. ` +
        `Humidity is ${conditions.humidity}% and wind is ${Math.round(conditions.windMph)} mph. ` +
        `Air quality is ${conditions.airQuality}.`;
}
