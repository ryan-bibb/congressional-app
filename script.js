const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const airForm = document.getElementById("airForm");
const airCityInput = document.getElementById("airCityInput");
const airResult = document.getElementById("airResult");
const aqiLabels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"};

weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
        return;
    }
    weatherResult.textContent = "Loading…";
    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error);
        }
        weatherResult.innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>
        <p>${Math.round(data.main.temp)} F ${data.weather[0].description}</p>
        <p>Feels like ${Math.round(data.main.feels_like)}</p>`;
    } catch (error) {
        weatherResult.textContent = error.message;
    }
});

airForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = airCityInput.value.trim();
    if (!city) {
        return;
    }
    airResult.textContent = "Loading…";
    try {
        const response = await fetch(`/api/air?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error);
        }
        const {components} = data;
        airResult.innerHTML = `<h2>${data.name}, ${data.country} Air Quality - ${aqiLabels[data.aqi]}</h2><p>PM2.5: ${components.pm2_5} — PM10: ${components.pm10}</p><p>O3: ${components.o3} — NO2: ${components.no2}</p>`;
    } catch (error) {
        airResult.textContent = error.message;
    }
});
