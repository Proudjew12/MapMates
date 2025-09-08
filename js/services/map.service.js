export const mapService = {
    initMap,
    getUserPosition,
    setMarker,
    panTo,
    lookupAddressGeo,
    addClickListener
}

let gMap
let gMarker

function initMap(lat = 32.0749831, lng = 34.9120554) {
    return new Promise((resolve) => {
        gMap = L.map(document.querySelector('.map'), {
            zoomSnap: 0.25,           // smoother zoom increments
            zoomDelta: 0.5,           // smaller zoom steps
            wheelDebounceTime: 40,    // smoother scroll zoom
            inertia: true,            // kinetic panning
            inertiaDeceleration: 3000 // slows down stop after drag
        }).setView([lat, lng], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(gMap)

        resolve()
    })
}

function panTo({ lat, lng, zoom = 15 }) {
    // Smooth animated transition
    gMap.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5 // in seconds
    })
}

async function lookupAddressGeo(geoOrAddress) {
    let url
    if (geoOrAddress.lat) {
        // Reverse geocoding
        url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoOrAddress.lat}&lon=${geoOrAddress.lng}`
    } else {
        // Forward geocoding
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoOrAddress)}`
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'TravelTip App' } })
    const data = await res.json()

    if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('Not found')
    }

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
        const geo = { lat: ev.latlng.lat, lng: ev.latlng.lng }
        try {
            const data = await lookupAddressGeo(geo)
            cb(data)
        } catch (err) {
            console.error('Geocoding failed', err)
        }
    })
}

function setMarker(loc) {
    if (gMarker) gMap.removeLayer(gMarker)
    if (!loc) return
    gMarker = L.marker([loc.geo.lat, loc.geo.lng], {
        riseOnHover: true
    })
        .addTo(gMap)
        .bindPopup(loc.name)
        .openPopup()
}

function getUserPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            },
            (err) => reject(err)
        )
    })
}
