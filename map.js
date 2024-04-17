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

map.on("click", async (e) => {
    if (geocoder._geocodeMarker) {
      map.removeLayer(geocoder._geocodeMarker);
    }
  
    if (marker) {
      map.removeLayer(marker);
    }
    marker = new L.Marker(e.latlng).addTo(map);
    await getWeather(e.latlng.lat, e.latlng.lng);
    displayData();
    displayDetailedWeather();
});

geocoder.on("markgeocode", async (e) => {
    console.log(e);
    if (marker) {
      map.removeLayer(marker);
    }
    await getWeather(e.geocode.center.lat, e.geocode.center.lng);
    displayData();
});