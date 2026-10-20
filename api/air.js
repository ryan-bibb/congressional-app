const {aqiLabels} = require("./_lib/aqi");

module.exports = async (req, res) => {
    const {city} = req.query;
    if (!city) {
        return res.status(400).json({error: "Missing city"});
    }
    const {WEATHER_API_KEY} = process.env;

    const geoResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`);
    if (!geoResponse.ok) {
        return res.status(geoResponse.status).json({error: "Can't find that city"});
    }
    const geo = await geoResponse.json();

    const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${geo.coord.lat}&lon=${geo.coord.lon}&appid=${WEATHER_API_KEY}`);
    if (!airResponse.ok) {
        return res.status(airResponse.status).json({error: "Couldn't get air quality"});
    }
    const air = await airResponse.json();

    res.json({
        name: geo.name,
        country: geo.sys.country,
        aqi: air.list[0].main.aqi,
        airQuality: aqiLabels[air.list[0].main.aqi],
        components: air.list[0].components,
    });
};
