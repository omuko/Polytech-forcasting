const apiKey = "3b7cfe7d73ca0e09f7e90a14c0239f32"; // 🔑 Replace with your real OpenWeather API key
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const locBtn = document.getElementById("locBtn");
const weatherResult = document.getElementById("weatherResult");
const forecastContainer = document.getElementById("forecast");

searchBtn.addEventListener("click", getWeatherByCity);
locBtn.addEventListener("click", getWeatherByLocation);
window.onload = loadLastCity;

// Get weather by city name
async function getWeatherByCity() {
  const city = cityInput.value.trim();
  if (!city) {
    weatherResult.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }
  await fetchWeatherData(city);
}

// Get weather using device location
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      await fetchWeatherData(null, lat, lon);
    }, () => {
      alert("Location access denied. Please enter a city manually.");
    });
  } else {
    alert("Geolocation not supported in your browser.");
  }
}

// Core data fetcher
async function fetchWeatherData(city = null, lat = null, lon = null) {
  try {
    let geoData;
    if (city) {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!geoResponse.ok) throw new Error("City not found");
      geoData = await geoResponse.json();
      lat = geoData.coord.lat;
      lon = geoData.coord.lon;
    }

    // Display current weather
    if (geoData) displayWeather(geoData);

    // ✅ Use One Call API 2.5 (Free)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`
    );

    const forecastData = await forecastResponse.json();

    if (forecastData.daily) {
      displayForecast(forecastData.daily);
    } else {
      forecastContainer.innerHTML = "<p>7-day forecast unavailable for this location.</p>";
    }

    if (city) localStorage.setItem("lastCity", city);
  } catch (error) {
    console.error(error);
    weatherResult.innerHTML = `<p>${error.message}</p>`;
    forecastContainer.innerHTML = "";
  }
}

function displayWeather(data) {
  const { name, main, weather } = data;
  const icon = weather[0].icon;
  const description = weather[0].description;

  weatherResult.innerHTML = `
    <h3>${name}</h3>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
    <p>${description}</p>
    <h2>${main.temp}°C</h2>
    <p>Humidity: ${main.humidity}%</p>
  `;

  setBackground(weather[0].main.toLowerCase());
}

function displayForecast(dailyData) {
  forecastContainer.innerHTML = "";
  dailyData.slice(0, 7).forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const icon = day.weather[0].icon;
    const description = day.weather[0].description;
    const temp = Math.round(day.temp.day);

    const dayCard = document.createElement("div");
    dayCard.classList.add("forecast-day");
    dayCard.innerHTML = `
      <h4>${dayName}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
      <p>${temp}°C</p>
      <p>${description}</p>
    `;
    forecastContainer.appendChild(dayCard);
  });
}

function setBackground(weatherType) {
  let bg;
  if (weatherType.includes("cloud")) bg = "linear-gradient(to right, #757f9a, #d7dde8)";
  else if (weatherType.includes("rain")) bg = "linear-gradient(to right, #373B44, #4286f4)";
  else if (weatherType.includes("clear")) bg = "linear-gradient(to right, #56ccf2, #2f80ed)";
  else if (weatherType.includes("snow")) bg = "linear-gradient(to right, #83a4d4, #b6fbff)";
  else bg = "linear-gradient(to right, #4facfe, #00f2fe)";
  document.body.style.background = bg;
}

function loadLastCity() {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    fetchWeatherData(lastCity);
  }
}
