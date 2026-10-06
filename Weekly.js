const {WEATHER_API_KEY, EMAIL_SERVICE_KEY, EMAIL_API_KEY} = process.env;
const ap1Labels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"};

async function main() {
    //Add date check
        const GEOResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`)
        if (!GEOResponse.ok) {
            throw new Error("Error Finding City")
        }
        const data = await GEOResponse.json();
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${WEATHER_API_KEY}`)

        if (!response.ok) {
            throw new Error("Error")
        }
        const GEOData = await response.json();
        const aqi = GEOData.list[0].main.aqi;
        const components = GEOData.list[0].components;
        const emailResponse = await fetch(`https://api.emailjs.com/api/v1.0/email/send"`);
}