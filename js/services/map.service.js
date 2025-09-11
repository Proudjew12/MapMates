import { locService } from "./loc.service.js"

export const mapService = {
    initMap,
    setMapTheme,
    getUserPosition,
    setMarker,
    removeMarker,
    setMarkers,
    panTo,
    lookupAddressGeo,
    addClickListener
}

let gMap
let gTileLayer
let gMarker
let gMarkers = []
function initMap(lat = 32.0749831, lng = 34.9120554) {
    return new Promise((resolve) => {
        gMap = L.map(document.querySelector('.map')).setView([lat, lng], 13)

        gTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(gMap)

        const formEl = document.querySelector('.form-search')
        if (formEl) {
            L.DomEvent.disableClickPropagation(formEl)
            L.DomEvent.disableScrollPropagation(formEl)
        }
        const themeEl = document.querySelector('.theme-toggle')
        if (themeEl) {
            L.DomEvent.disableClickPropagation(themeEl)
            L.DomEvent.disableScrollPropagation(themeEl)
        }
        resolve()
    })
}

function setMapTheme(theme) {
    if (gTileLayer) gMap.removeLayer(gTileLayer)

    if (theme === 'dark') {
        gTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(gMap)
    } else {
        gTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(gMap)
    }
}

function panTo({ lat, lng, zoom = 15 }) {
    gMap.flyTo([lat, lng], zoom, { animate: true, duration: 1.5 })
}

async function lookupAddressGeo(geoOrAddress) {
    let url
    if (geoOrAddress.lat) {
        url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoOrAddress.lat}&lon=${geoOrAddress.lng}`
    } else {
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoOrAddress)}`
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'TravelTip App' } })
    const data = await res.json()
    if (!data || (Array.isArray(data) && data.length === 0)) throw new Error('Not found')

    const result = Array.isArray(data) ? data[0] : data
    return {
        address: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        zoom: gMap.getZoom()
    }
}

function addClickListener(cb) {
    gMap.on('click', async (ev) => {
        const geo = { lat: ev.latlng.lat, lng: ev.latlng.lng, address: 'Loading…' }

        cb(geo)

        try {
            const data = await lookupAddressGeo(geo)
            geo.address = data.address

            const input = document.getElementById('swal-input-name')
            if (input) input.value = geo.address
        } catch (err) {
            console.error('Geocoding failed', err)
        }
    })
}


function setMarker(loc) {
    if (!loc) return
    gMarker = L.marker([loc.geo.lat, loc.geo.lng], { riseOnHover: true })
        .addTo(gMap)
        .bindPopup(loc.name)
        .openPopup()
        gMarkers.push(gMarker)        
}
function removeMarker(loc){
const marker = gMarkers.find(marker=>(marker.getLatLng().lat === loc.geo.lat && marker.getLatLng().lng === loc.geo.lng))
const idx = gMarkers.findIndex(marker=>(marker.getLatLng().lat === loc.geo.lat && marker.getLatLng().lng === loc.geo.lng))
gMap.removeLayer(marker)
gMarkers.splice(idx,1)
}
function getUserPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            err => reject(err)
        )
    })
}
function setMarkers(locs){
locs.forEach(loc => {
    setMarker(loc)
});
}

