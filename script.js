
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const airForm = document.getElementById("airForm");
const airCityInput = document.getElementById("airCityInput");
const airResult = document.getElementById("airResult");
const ap1Labels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"};
const WEATHER_API_KEY = "9a16fb3eba439890602f3b958e701574"

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
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}')
        if (!response.ok) {
            throw new Error("Error Finding City")
        }
        const data = await response.json();
    }catch(error){
        airResult.textContent = error.message;
    }
})