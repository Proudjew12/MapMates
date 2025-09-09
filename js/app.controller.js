import { utilService } from './services/util.service.js'
import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { appService } from './services/app.service.js'

window.onload = onInit

window.app = {
    onRemoveLoc,
    onUpdateLoc,
    onSelectLoc,
    onPanToUserPos,
    onSearchAddress,
    onSetSortBy,
    onSetFilterBy,
    onSetMapTheme,
}

let gUserPos = null

function onInit() {
    getFilterByFromQueryParams()
    loadAndRenderLocs()
    mapService.initMap()
        .then(() => {
            mapService.addClickListener(onAddLoc)
        })
        .catch(err => {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot init map', 'error')
        })
}

function renderLocs(locs) {
    const selectedLocId = getLocIdFromQueryParams()
    const strHTML = locs.map(loc => {
        const className = (loc.id === selectedLocId) ? 'active' : ''
        return `
        <li class="loc ${className}" data-id="${loc.id}">
            <h4>
                <span>${loc.name}</span>
                <span title="${loc.rate} stars">${'★'.repeat(loc.rate)}</span>
            </h4>
                <p class="muted">
                 Created: ${utilService.elapsedTime(loc.createdAt)}
                 ${(loc.createdAt !== loc.updatedAt)
                ? ` | Updated: ${utilService.elapsedTime(loc.updatedAt)}`
                : ''}
                 ${gUserPos
                ? ` | Distance: ${utilService.getDistance(gUserPos, loc.geo)} km`
                : ''}
                </p>

            <div class="loc-btns">
                <button onclick="app.onRemoveLoc('${loc.id}')">🗑️</button>
                <button onclick="app.onUpdateLoc('${loc.id}')">✏️</button>
                <button onclick="app.onSelectLoc('${loc.id}')">🗺️</button>
            </div>
        </li>`
    }).join('')

    document.querySelector('.loc-list').innerHTML = strHTML || 'No locs to show'
    renderLocStats()

    if (selectedLocId) {
        const selectedLoc = locs.find(loc => loc.id === selectedLocId)
        if (selectedLoc) onSelectLoc(selectedLoc.id)
    }
}

async function onRemoveLoc(locId) {
    const ok = await appService.confirm("Do you really want to delete this location?")
    if (!ok) return
    try {
        locService.getById(locId)
        .then(mapService.removeMarker)
        await locService.remove(locId)
        appService.flashMsg('Location removed', 'success')
        
        
        loadAndRenderLocs()
    } catch (err) {
        console.error('OOPs:', err)
        appService.flashMsg('Cannot remove location', 'error')
    }
}

function onSearchAddress(ev) {
    ev.preventDefault()
    const el = document.querySelector('[name=address]')
    mapService.lookupAddressGeo(el.value)
        .then(geo => mapService.panTo(geo))
        .catch(err => {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot lookup address', 'error')
        })
}



function onAddLoc(geo) {
    Swal.fire({
        title: 'Add Location',
        html: `
            <input id="swal-input-name" class="swal2-input" placeholder="Location name" value="${geo.address || ''}">
            <input id="swal-input-rate" type="number" min="1" max="5" class="swal2-input" value="3">
        `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        preConfirm: () => ({
            name: document.getElementById('swal-input-name').value,
            rate: +document.getElementById('swal-input-rate').value
        })
    }).then(async result => {
        if (!result.value) return
        const loc = { name: result.value.name, rate: result.value.rate, geo }
        try {
            const savedLoc = await locService.save(loc)
            mapService.panTo(savedLoc.geo)
            mapService.setMarker(savedLoc)
            loadAndRenderLocs()
        } catch (err) {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot add location', 'error')
        }
    })
}

function loadAndRenderLocs() {
    locService.query()
        .then(renderLocs)
        .catch(err => {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot load locations', 'error')
        })
     locService.query()
     .then(mapService.setMarkers)  
     .catch(err => {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot load locations', 'error')
        }) 
}

function onPanToUserPos() {
    mapService.getUserPosition()
        .then(latLng => {
            gUserPos = latLng
            mapService.panTo({ ...latLng, zoom: 15 })
            appService.flashMsg(`You are at Latitude: ${latLng.lat}, Longitude: ${latLng.lng}`, 'info')
            loadAndRenderLocs()
        })
        .catch(err => {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot get your position', 'error')
        })
}


function onUpdateLoc(locId) {
    locService.getById(locId)
        .then(loc => {
            const rate = prompt('New rate?', loc.rate)
            if (rate && rate !== loc.rate) {
                loc.rate = +rate
                locService.save(loc)
                    .then(savedLoc => {
                        appService.flashMsg(`Rate updated to ${savedLoc.rate}`, 'success')
                        loadAndRenderLocs()
                    })
            }
        })
}

function onSelectLoc(locId) {
    locService.getById(locId)
        .then(loc => {
            mapService.panTo(loc.geo)
            mapService.setMarker(loc)
            displayLoc(loc)
        })
        .catch(err => {
            console.error('OOPs:', err)
            appService.flashMsg('Cannot display location', 'error')
        })
}
function displayLoc(loc) {
    appService.showLocModal(loc)
}


function getFilterByFromQueryParams() {
    const params = new URLSearchParams(window.location.search)
    const txt = params.get('txt') || ''
    const minRate = params.get('minRate') || 0
    locService.setFilterBy({ txt, minRate })
    document.querySelector('[name="filter-by-txt"]').value = txt
    document.querySelector('[name="filter-by-rate"]').value = minRate
}

function getLocIdFromQueryParams() {
    const params = new URLSearchParams(window.location.search)
    return params.get('locId')
}

function onSetSortBy() {
    const prop = document.querySelector('.sort-by').value
    const isDesc = document.querySelector('.sort-desc').checked
    if (!prop) return
    const sortBy = {}
    sortBy[prop] = isDesc ? -1 : 1
    locService.setSortBy(sortBy)
    loadAndRenderLocs()
}

function onSetFilterBy({ txt, minRate }) {
    locService.setFilterBy({ txt, minRate: +minRate })
    loadAndRenderLocs()

}

function renderLocStats() {
    locService.getLocCountByRateMap().then(stats => handleStats(stats, 'loc-stats-rate'))
    locService.getLocCountByUpdatedMap().then(stats => handleStats(stats, 'loc-stats-updated'))
}


function handleStats(stats, selector) {
    const labels = cleanStats(stats)
    const baseColors = selector.includes('updated')
        ? ['#00c9a7', '#ffd166', '#ff5c8a']
        : utilService.getColors()

    let sumPercent = 0
    let colorsStr = `${baseColors[0]} 0%, `
    labels.forEach((label, idx) => {
        if (idx === labels.length - 1) return
        const count = stats[label]
        const percent = Math.round((count / stats.total) * 100)
        sumPercent += percent
        colorsStr += `${baseColors[idx]} ${sumPercent}%, ${baseColors[idx + 1]} ${sumPercent}%, `
    })
    colorsStr += `${baseColors[labels.length - 1]} 100%`

    document.querySelector(`.${selector} .pie`).style = `background-image: conic-gradient(${colorsStr})`
    document.querySelector(`.${selector} .legend`).innerHTML = labels.map((label, idx) =>
        `<li><span class="pie-label" style="background-color:${baseColors[idx]}"></span>${label} (${stats[label]})</li>`
    ).join('')
}



function cleanStats(stats) {
    return Object.keys(stats).filter(label => label !== 'total' && stats[label])
}
function onSetMapTheme(theme) {
    mapService.setMapTheme(theme)
}
