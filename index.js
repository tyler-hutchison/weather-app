let map = L.map("map").setView([50.9971, -118.1953], 12); // initialize map

// topographic layer (default)
const Esri_WorldTopoMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
  }
).addTo(map);

// satelite imagery layer
const Esri_WorldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

const baseMaps = {
  "Topographic Map": Esri_WorldTopoMap,
  "Satelite Imagery": Esri_WorldImagery,
};

let layerControl = L.control.layers(baseMaps).addTo(map); // add layer radio buttons to map
L.control.scale().addTo(map); // add scale to map
map.zoomControl.setPosition("bottomright"); // position zoom buttons
let geocoder = L.Control.geocoder().addTo(map); // add geocoder search button to map
geocoder.setPosition("topleft"); // position search button
let marker;

const onMapClick = async (e) => {
  if (geocoder._geocodeMarker) {
    map.removeLayer(geocoder._geocodeMarker);
  }

  if (marker) {
    map.removeLayer(marker);
  }
  marker = new L.Marker(e.latlng).addTo(map);
  await getWeather(e.latlng.lat, e.latlng.lng);
  displayData();
};

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

  // detailed weather
  $(".detailed-forecast-container").remove();
  $("#detailed-forecast").append(
    '<div class="detailed-forecast-container"><canvas id="myChart"></canvas></div>'
  );

  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  let timeData = hourly.time.map((element) => element.split("T")[1]); // converts ISO 8601 date & time to 24 hour notation in an array

  // let temperatureChart = new Chart($temperatureChart, {
  //   type: "line",
  //   data: {
  //     labels: timeData,
  //     datasets: [{
  //       data: hourly.temperature_2m,
  //       borderColor: "red",
  //       fill: false
  //     },{
  //       data: hourly.apparent_temperature,
  //       borderColor: "yellow",
  //       fill: false
  //     },{
  //       data: hourly.relative_humidity_2m,
  //       borderColor: "blue",
  //       fill: false
  //     }]
  //   }
  // });
};

map.on("click", onMapClick);

geocoder.on("markgeocode", async function (e) {
  console.log(e);
  if (marker) {
    map.removeLayer(marker);
  }
  await getWeather(e.geocode.center.lat, e.geocode.center.lng);
  displayData();
});
