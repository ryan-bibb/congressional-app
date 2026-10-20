
const aqiLabels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"};
module.exports = async(req, res) => {
    const {city} = req.query;
    if (!city) {
        return res.status(400).json({error:"Missing City"});
    }
    const {OPENAI_API_KEY} = process.env;
    const {WEATHER_API_KEY} = process.env;
    const WeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=imperial`);
    if (!WeatherResponse.ok) {
        return res.status(WeatherResponse.status).json({error: "Can't find that city"});
    }
    const weather = res.json(await WeatherResponse.json());

    const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${geo.coord.lat}&lon=${geo.coord.lon}&appid=${WEATHER_API_KEY}`);
    if (!airResponse.ok) {
        return res.status(airResponse.status).json({error: "Couldn't get air quality"});
    }

    const air = await airResponse.json();
    const WeatherConditions = {city: `${weather.name}, ${weather.sys.country}`,

        temperatureF: Math.round(weather.main.temp),

        feelsLikeF: Math.round(weather.main.feels_like),

        description: weather.weather[0].description,

        humidity: weather.main.humidity,

        windMph: weather.wind.speed,

        airQuality: aqiLabels[air.list[0].main.aqi],

        pollutants: air.list[0].components,}
    const AIResponse = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method:"POST",
        headers: {

            "Content-Type": "application/json",

            "Authorization": `Bearer ${OPENAI_API_KEY}`,

        },
        body: JSON.stringify({

            model: "gpt-4o-mini",

            messages: [

                {

                    role: "system",

                    content: "You give short, friendly advice based on current weather and air quality. In 3-5 plain-text sentences (no markdown), summarize the conditions and tell the user how to react: what to wear, whether to bring an umbrella or sunscreen, and whether outdoor activity is a good idea given the air quality. Mention extra precautions for sensitive groups if air quality is moderate or worse. Warn me about cities within a 20 mile radius of my city that have a poor Air quality rating today",

                },

                {role: "user", content: JSON.stringify(conditions)},

            ],

        }),
    });

}
