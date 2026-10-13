const {WEATHER_API_KEY, EMAIL_SERVICE_KEY, EMAIL_API_KEY} = process.env;
const aqiLabels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"};

async function main() {
    //Add date check
    const geoResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`);
    if (!geoResponse.ok) {
        throw new Error("Can't find that city");
    }
    const geo = await geoResponse.json();
    const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${geo.coord.lat}&lon=${geo.coord.lon}&appid=${WEATHER_API_KEY}`);
    if (!airResponse.ok) {
        throw new Error("Couldn't get air quality");
    }
    const air = await airResponse.json();
    const aqi = air.list[0].main.aqi;
    const components = air.list[0].components;
    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send");
}
