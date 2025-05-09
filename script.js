document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const cityInput = document.querySelector(".city-input");
  const searchBtn = document.querySelector(".search-btn");

  const notFoundSection = document.querySelector(".not-found");
  const searchCitySection = document.querySelector(".search-city");
  const weatherInfoSection = document.querySelector(".weather-info");

  const countryTxt = document.querySelector(".country-txt");
  const tempTxt = document.querySelector(".temp-txt");
  const conditionTxt = document.querySelector(".condition-txt");
  const humidityValueTxt = document.querySelector(".humidity-value-txt");
  const windValueTxt = document.querySelector(".wind-value-txt");
  const weatherSummaryImg = document.querySelector(".weather-summary-img");
  const currentDateTxt = document.querySelector(".current-date-txt");

  const forecastItemContainer = document.querySelector(
    ".forecast-item-container"
  );

  // Use your own API key
  const apikey = "363bc7a1fe76db4aba3bfc79bdf6ae7c"; // Replace with your OpenWeather API key

  // Event Listeners
  if (cityInput && searchBtn) {
    searchBtn.addEventListener("click", () => {
      if (cityInput.value.trim() !== "") {
        updateWeatherInfo(cityInput.value);
        cityInput.value = "";
        cityInput.blur(); // Remove focus from the input field
      }
    });

    cityInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && cityInput.value.trim() !== "") {
        updateWeatherInfo(cityInput.value);
        cityInput.value = "";
        cityInput.blur();
      }
    });
  } else {
    console.error("cityInput or searchBtn not found in the DOM.");
  }

  // Fetch Data from API
  async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric`;
    try {
      const response = await fetch(apiUrl);
      return response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  // Update Weather Information
  async function updateWeatherInfo(city) {
    const weatherData = await getFetchData("weather", city);

    if (!weatherData || weatherData.cod !== 200) {
      showDisplaySection(notFoundSection);
      return;
    }

    const {
      name: country,
      main: { temp, humidity },
      weather: [{ id, main }],
      wind: { speed },
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity} %`;
    windValueTxt.textContent = `${speed} M/s`;

    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastInfo(city);
    showDisplaySection(weatherInfoSection);
  }

  // Update Forecast Information
  async function updateForecastInfo(city) {
    const forecastData = await getFetchData("forecast", city);

    if (!forecastData || !forecastData.list) return;

    const timeTaken = "12:00:00";
    const todayDate = new Date().toISOString().split("T")[0];

    forecastItemContainer.innerHTML = ""; // Clear previous forecast items

    forecastData.list.forEach((forecastWeather) => {
      if (
        forecastWeather.dt_txt.includes(timeTaken) &&
        !forecastWeather.dt_txt.includes(todayDate)
      ) {
        updateForecastItems(forecastWeather);
      }
    });
  }

  // Update Individual Forecast Items
  function updateForecastItems(weatherData) {
    const {
      dt_txt: date,
      weather: [{ id }],
      main: { temp },
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = { day: "2-digit", month: "short" };
    const dateResult = dateTaken.toLocaleDateString("en-US", dateOption);

    const forecastItem = `
      <div class="forecast-item">
        <h5 class="forecast-item-date regular-text">${dateResult}</h5>
        <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" alt="Weather Icon">
        <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
      </div>
    `;

    forecastItemContainer.insertAdjacentHTML("beforeend", forecastItem);
  }

  // Get Weather Icon Based on ID
  function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return "thunderstorm.svg";
    if (id >= 300 && id <= 321) return "drizzle.svg";
    if (id >= 500 && id <= 531) return "rain.svg";
    if (id >= 600 && id <= 622) return "snow.svg";
    if (id === 800) return "clear.svg";
    if (id >= 801 && id <= 804) return "clouds.svg";
    return "clear.svg";
  }

  // Get Current Date
  function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: "short", month: "short", day: "2-digit" };
    return currentDate.toLocaleDateString("en-GB", options);
  }

  // Show Specific Section
  function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(
      (sec) => (sec.style.display = "none")
    );
    section.style.display = "flex";
  }
});