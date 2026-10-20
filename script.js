const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const airForm = document.getElementById("airForm");
const airCityInput = document.getElementById("airCityInput");
const airResult = document.getElementById("airResult");
const summaryForm = document.getElementById("summaryForm");
const summaryCityInput = document.getElementById("summaryCityInput");
const summaryResult = document.getElementById("summaryResult");
const signupForm = document.getElementById("signupForm");
const signupEmailInput = document.getElementById("signupEmailInput");
const signupCityInput = document.getElementById("signupCityInput");
const signupResult = document.getElementById("signupResult");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    signupResult.textContent = "Signing up…";
    try {
        const response = await fetch("/api/subscribe", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email: signupEmailInput.value, city: signupCityInput.value}),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error);
        }
        signupResult.textContent = data.message;
        signupForm.reset();
    } catch (error) {
        signupResult.textContent = error.message;
    }
});

summaryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = summaryCityInput.value.trim();
    if (!city) {
        return;
    }
    summaryResult.textContent = "Loading…";
    try {
        const response = await fetch(`/api/summary?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error);
        }
        const heading = document.createElement("h2");
        heading.textContent = data.city;
        const summary = document.createElement("p");
        summary.textContent = data.summary;
        summaryResult.replaceChildren(heading, summary);
        if (data.nearby.length) {
            const nearby = document.createElement("p");
            nearby.className = "nearby";
            const label = document.createElement("strong");
            label.textContent = "Nearby air quality: ";
            nearby.append(label, data.nearby.map((place) => `${place.city} (${place.miles} mi ${place.direction}) – ${place.airQuality}`).join(" · "));
            summaryResult.append(nearby);
        }
    } catch (error) {
        summaryResult.textContent = error.message;
    }
});

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
        airResult.innerHTML = `<h2>${data.name}, ${data.country} Air Quality - ${data.airQuality}</h2><p>PM2.5: ${components.pm2_5} — PM10: ${components.pm10}</p><p>O3: ${components.o3} — NO2: ${components.no2}</p>`;
    } catch (error) {
        airResult.textContent = error.message;
    }
});
