# 🌍 TravelTip  
### *“The app that gets you somewhere.”*  

## ✨ About  
TravelTip is a lightweight, fun app for managing and exploring your favorite spots around the globe.  
Whether it’s **your hidden beach café**, **your top hiking trail**, or just **where you parked your car** — TravelTip keeps them all in one place.  

## 🚀 Features  
- 📍 Save & manage locations  
- 🔎 Search any address (geocoding with OpenStreetMap / Nominatim)  
- 🧭 Jump to your current location  
- ⭐ Rate, sort & filter your places  
- 🔗 Share links (copy or use the Web Share API)  

## 🛠️ Locations CRUDL  
- ➕ Create – click on the map → add name + rate  
- 👀 Read – view details in the header  
- ✏️ Update – change location rate  
- ❌ Delete – remove a location  
- 📑 List – filter, sort, and group saved spots  

## 🗺️ Selected Location  
- Highlighted in the list ✨  
- Marker on the map 📍  
- Auto-updates URL query params 🔗  
- Copy & share support ⚡  

## 🧾 Location Object Format  
```js
{
  id: 'GEouN',
  name: 'Dahab, Egypt',
  rate: 5,
  geo: {
    address: 'Dahab, South Sinai, Egypt',
    lat: 28.5096676,
    lng: 34.5165187,
    zoom: 11
  },
  createdAt: 1706562160181,
  updatedAt: 1706562160181
}
```

## 🔧 Services & Controller  
```js
export const locService = {
  query,
  getById,
  remove,
  save,
  setFilterBy,
  setSortBy,
  getLocCountByRateMap
}

export const mapService = {
  initMap,
  getPosition,
  setMarker,
  panTo,
  lookupAddressGeo,
  addClickListener
}

window.app = {
  onRemoveLoc,
  onUpdateLoc,
  onSelectLoc,
  onPanToUserPos,
  onSearchAddress,
  onCopyLoc,
  onShareLoc,
  onSetSortBy,
  onSetFilterBy
}
```

### Example Usage  
```html
<button onclick="app.onCopyLoc()">📋 Copy location</button>
<button onclick="app.onShareLoc()">📤 Share location</button>
```

## 🌐 Tech Stack  
- [Leaflet.js](https://leafletjs.com/) for maps  
- [OpenStreetMap + Nominatim](https://nominatim.openstreetmap.org/) for geocoding  
- Vanilla JS + Local Storage  

## 🚀 Try It Live  
👉 [**Click here to try the app**](https://proudjew12.github.io/MapMates/)  
