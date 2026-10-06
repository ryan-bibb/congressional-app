
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const airForm = document.getElementById("airForm");
const airCityInput = document.getElementById("airCityInput");
const airResult = document.getElementById("airResult");
const ap1Labels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"};
const {WEATHER_API_KEY} = process.env;


weatherForm.addEventListener("submit", async (event)=>{
    event.preventDefault();
    const city = cityInput.value.trim()
    if (!city) {
        return;
    }
    weatherResult.textContent = "loading";
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=imperial`);
        if (!response.ok) {
            throw new Error("Error Finding City");        
        }
        const data = await response.json();
        weatherResult.innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>
        <p>${Math.round(data.main.temp)} F ${data.weather[0].description}</p>
        <p> Feels like ${Math.round(data.main.feels_like)}</p>`
    }catch(error){
        weatherResult.textContent = error.message;
    }
})

airForm.addEventListener("submit", async (event)=>{
    event.preventDefault();
    const city = airCityInput.value.trim()
    if (!city) {
        return;
    } 
    airResult.textContent = "loading";
    
    try{
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
        airResult.innerHTML = `<h2>${data.name}, ${data.sys.country} Air Quality - ${ap1Labels[aqi]}</h2><p>PM2.5: ${components.pm2_5} — PM10: ${components.pm10}</p><p>O3: ${components.o3} — NO2: ${components.no2}</p>`

        
    }catch(error){
        airResult.textContent = error.message;
    }
})