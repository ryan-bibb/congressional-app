module.exports = async (req, res) => {
    const {city} = req.query;
    if (!city) {
        return res.status(400).json({error: "Missing city"});
    }
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=imperial`);
    if (!response.ok) {
        return res.status(response.status).json({error: "Can't find that city"});
    }
    res.json(await response.json());
};
