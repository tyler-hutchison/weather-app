let weatherData = {};

const getWeather = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,,apparent_temperature,rain,showers,snowfall,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,freezing_level_height&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max&timezone=auto`
    );
    const data = await response.json();
    Object.assign(weatherData, data);
    console.log("weather data: ", weatherData);
  } catch (err) {
    console.log(err);
  }
};

const degToCompass = (num) => {
  var val = Math.floor(num / 22.5 + 0.5); //  divide angle by 22.5 (360/16 = 22.5), add 0.5 for half values and truncate
  var arr = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return arr[val % 16]; //  return the remainder
};

const getSymbol = (weatherCode) => {
  if (weatherCode < 3) {
    return "sun";
  } else if (
    (3 <= weatherCode && weatherCode < 10) ||
    (13 <= weatherCode && weatherCode < 30)
  ) {
    return "cloud";
  } else if (30 <= weatherCode && weatherCode < 40) {
    return "wind";
  } else if (
    (10 <= weatherCode && weatherCode < 13) ||
    (40 <= weatherCode && weatherCode < 50)
  ) {
    return "foggy";
  } else if (
    (50 <= weatherCode && weatherCode < 56) ||
    (58 <= weatherCode && weatherCode < 60)
  ) {
    return "showers";
  } else if (
    (60 <= weatherCode && weatherCode < 66) ||
    (80 <= weatherCode && weatherCode < 83)
  ) {
    return "rain";
  } else if (
    (70 <= weatherCode && weatherCode < 80) ||
    (85 <= weatherCode && weatherCode < 87)
  ) {
    return "snow";
  } else if (
    (56 <= weatherCode && weatherCode < 58) ||
    (66 <= weatherCode && weatherCode < 70) ||
    (83 <= weatherCode && weatherCode < 85) ||
    (87 <= weatherCode && weatherCode < 91)
  ) {
    return "freezing_rain";
  } else if (91 <= weatherCode && weatherCode < 100) {
    return "thunderstorm";
  } else {
    return "weather";
  }
};

const displayData = () => {
  let { current, current_units, daily, daily_units, hourly, hourly_units } =
    weatherData;

  //  add current weather table
  $(".current-weather-container").remove();
  $("#current-weather").append('<div class="current-weather-container"></div>');
  $(".current-weather-container").append(
    '<div class="current-weather-table"></div>'
  );
  $(".current-weather-table")
    .append('<div class="current-icon"></div>')
    .append('<div class="current-location"></div>')
    .append('<div class="current-condition"></div>')
    .append('<div class="current-temp"></div>')
    .append('<div class="current-wind"></div>');

  //  current weather icon and temperature

  let icon = getSymbol(current.weather_code);

  if (icon === "sun" && current.is_day !== 1) {
    icon = "night";
  }

  let currentTempDisplay =
    Math.round(current.temperature_2m).toString() +
    current_units.temperature_2m.toString();

  let apparentTempDisplay =
    Math.round(current.apparent_temperature).toString() +
    current_units.apparent_temperature.toString();

  $(".current-icon")
    .append('<div class="current-icon-container"></div>')
    .append(`<p>${currentTempDisplay}</p>`)
    .append(`<p>Feels like: ${apparentTempDisplay}</p>`)
    .append(
      '<p class="credit">Icon by <a href="https://www.flaticon.com/authors/freepik" target="_blank">Freepik</a><p>'
    );
  $(".current-icon-container").append(
    `<img class="weather-icon" id="current-weather-icon" src="/weather-app/images/${icon}.png" alt="weather-icon">`
  );

  //  more specific current temperature info
  let newstring = current.time.replace(/:\d{2}/, ":00"); //  replace any minute value with 00

  let hourlyIndex = hourly.time.indexOf(newstring); //  get hourlyIndex for hourly data relating to current hour

  $(".current-temp")
    .append(
      `<p>Temperature: ${current.temperature_2m}${current_units.temperature_2m}</p>`
    )
    .append(
      `<p>Dew point: ${hourly.dew_point_2m[hourlyIndex]}${hourly_units.dew_point_2m}</p>`
    )
    .append(
      `<p>Humidity: ${current.relative_humidity_2m}${current_units.relative_humidity_2m}</p>`
    );

  //  current location info
  $(".current-location")
    .append(
      `<p>Location: ${weatherData.latitude}, ${weatherData.longitude}, ${weatherData.elevation}m ASL</p>`
    )
    .append(
      `<p>Time: ${current.time} ${weatherData.timezone}, ${
        weatherData.timezone_abbreviation
      }, UTC${weatherData.utc_offset_seconds / 3600}</p>`
    );

  //  current condition info
  $(".current-condition")
    .append(
      `<p>Freezing Level: ${hourly.freezing_level_height[hourlyIndex]}${hourly_units.freezing_level_height}</p>`
    )
    .append(
      `<p>Cloud Cover: ${current.cloud_cover}${current_units.cloud_cover}</p>`
    )
    .append(
      `<p>Visibility: ${hourly.visibility[hourlyIndex] / 1000} K${
        hourly_units.visibility
      }</p>`
    );

  //  current wind info
  let windDirStr = degToCompass(current.wind_direction_10m);

  $(".current-wind")
    .append(
      `<p>Wind: ${current.wind_speed_10m} ${current_units.wind_speed_10m} ${windDirStr}</p>`
    )
    .append(
      `<p>Wind Gusts: ${current.wind_gusts_10m}${current_units.wind_gusts_10m}</p>`
    );

  // 7 day forecast
  $(".forecast-container").remove();
  $("#forecast").append('<div class="forecast-container"></div>');
  $(".forecast-container").append('<div class="forecast-table"></div>');

  const daysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let date = new Date();
  let today = date.getDay();

  let sevenDays = daysOfTheWeek
    .slice(today)
    .concat(daysOfTheWeek.slice(0, today));

  $.each(sevenDays, function (dayIndex, day) {
    let dailyIcon = getSymbol(daily.weather_code[dayIndex]);
    let divID = day.toLowerCase();
    let $container = $(`<div id="${divID}-forecast"></div>`);
    $container
      .append(`<p>${day.slice(0, 3)} </p>`)
      .append(`<div class="daily-icon-container"></div>`)
      //.append(`<p>${daily.weather_code[dayIndex]}</p>`)
      .append(
        `<p><b>${daily.temperature_2m_max[dayIndex]}</b> / ${daily.temperature_2m_min[dayIndex]}${daily_units.temperature_2m_max}</p>`
      );

    if (daily.precipitation_probability_max[dayIndex] > 0) {
      $container.append(
        `PoP: ${daily.precipitation_probability_max[dayIndex]}${daily_units.precipitation_probability_max}`
      );
    }

    $container
      .find(".daily-icon-container")
      .append(
        `<img class="weather-icon" src="/weather-app/images/${dailyIcon}.png" alt="weather-icon">`
      );
    $(".forecast-table").append($container);
  });

  $(".detailed-forecast-container").remove();
  $("#detailed-forecast")
    .append(
      '<div class="detailed-forecast-container"><canvas id="temperature-chart" class="detailed-chart"></canvas></div>'
    )
    .append(
      '<div class="detailed-forecast-container"><canvas id="precipitation-chart" class="detailed-chart"></canvas></div>'
    )
    .append(
      '<div class="detailed-forecast-container"><canvas id="cloud-chart" class="detailed-chart"></canvas></div>'
    )
    .append(
      '<div class="detailed-forecast-container"><canvas id="wind-chart" class="detailed-chart"></canvas></div>'
    );
};

const addArray = (arr) => {
  // makes a cummulative array from an array of hourly rain or snow values
  let sum = 0;
  let newArr = [];
  arr.map((num) => {
    sum += num;
    newArr.push(sum);
  });
  return newArr;
};

const displayDetailedWeather = () => {
  // detailed weather

  let timeData = weatherData.hourly.time.map(
    (element) => element.split("T")[1]
  ); // converts ISO 8601 date & time to 24 hour notation in an array
  let rainArr = addArray(weatherData.hourly.rain);
  let snowArr = addArray(weatherData.hourly.snowfall);
  let showersArr = addArray(weatherData.hourly.showers);

  new Chart($("#temperature-chart"), {
    type: "line",
    data: {
      labels: timeData,
      datasets: [
        {
          label: "Temperature",
          data: weatherData.hourly.temperature_2m,
          borderColor: "red",
          fill: false,
        },
        {
          label: "Feels Like",
          data: weatherData.hourly.apparent_temperature,
          borderColor: "yellow",
          fill: false,
        },
        {
          label: "Dew Point",
          data: weatherData.hourly.dew_point_2m,
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            align: "center",
            text: `Temperature (${weatherData.hourly_units.temperature_2m})`,
          },
        },
      },
    },
  });

  new Chart($("#precipitation-chart"), {
    type: "line",
    data: {
      labels: timeData,
      datasets: [
        {
          label: "Snow (cm)",
          data: snowArr,
          borderColor: "grey",
          fill: false,
        },
        {
          label: "Rain (mm)",
          data: rainArr,
          borderColor: "blue",
          fill: false,
        },
        {
          label: "Showers (mm)",
          data: showersArr,
          borderColor: "black",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            align: "center",
            text: `Precipitation (${weatherData.hourly_units.rain}/${weatherData.hourly_units.snowfall})`,
          },
        },
      },
    },
  });

  new Chart($("#cloud-chart"), {
    type: "line",
    data: {
      labels: timeData,
      datasets: [
        {
          label: "Total",
          data: weatherData.hourly.cloud_cover,
          borderColor: "red",
          fill: false,
        },
        {
          label: "High",
          data: weatherData.hourly.cloud_cover_high,
          borderColor: "grey",
          fill: false,
        },
        {
          label: "Mid",
          data: weatherData.hourly.cloud_cover_mid,
          borderColor: "blue",
          fill: false,
        },
        {
          label: "Low",
          data: weatherData.hourly.cloud_cover_low,
          borderColor: "black",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            align: "center",
            text: `Cloud Cover (${weatherData.hourly_units.cloud_cover})`,
          },
        },
      },
    },
  });

  new Chart($("#wind-chart"), {
    type: "line",
    data: {
      labels: timeData,
      datasets: [
        {
          label: "Wind Speed",
          data: weatherData.hourly.wind_speed_10m,
          borderColor: "red",
          fill: false,
        },
        {
          label: "Wind Gusts",
          data: weatherData.hourly.wind_gusts_10m,
          borderColor: "grey",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            align: "center",
            text: `Wind Speed (${weatherData.hourly_units.wind_speed_10m})`,
          },
        },
      },
    },
  });
};

/*
  TO DO:

- change weather icon logic
  -no sun and cloud condition
- add detailed forecast
- make it look pretty
*/
