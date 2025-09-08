export const appService = {
    confirm,
    flashMsg,
    showLocModal
}

function confirm(message) {
    return Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then(res => res.isConfirmed)
}

function flashMsg(msg, type = 'info', timeout = 2000) {
    Swal.fire({
        text: msg,
        icon: type,
        timer: timeout,
        showConfirmButton: false,
        position: 'top',
        toast: true
    })
}

function showLocModal(loc) {
    return Swal.fire({
        title: loc.name,
        text: `${loc.geo.address}\nRated: ${'★'.repeat(loc.rate)}`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '📋 Copy Link',
        cancelButtonText: '📤 Share',
        reverseButtons: true
    }).then(res => {
        const url = window.location.href

        if (res.isConfirmed) {
            navigator.clipboard.writeText(url)
            Swal.fire('Copied!', 'Location link copied', 'success')
        }
        else if (res.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Share location',
                html: `
                    <div class="share-menu">
                        <button class="btn-share" data-action="qr">📱 Generate QR Code</button>
                        <button class="btn-share" data-action="copy">📋 Copy to Clipboard</button>
                        <button class="btn-share" data-action="email">📧 Send via Email</button>
                        <button class="btn-share" data-action="device">📲 Send to Device</button>
                        <button class="btn-share" data-action="sms">📩 Send SMS</button>
                    </div>
                `,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Close',
                didOpen: () => {
                    document.querySelectorAll('.btn-share').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const action = btn.dataset.action
                            if (action === 'qr') {
                                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200`
                                Swal.fire({ title: 'QR Code', html: `<img src="${qrUrl}" alt="QR Code">` })
                            }
                            if (action === 'copy') {
                                navigator.clipboard.writeText(url)
                                Swal.fire('Copied!', 'Link copied to clipboard', 'success')
                            }
                            if (action === 'email') {
                                window.location.href = `mailto:?subject=Check this location&body=${encodeURIComponent(url)}`
                            }
                            if (action === 'device') {
                                Swal.fire('Send to Device', 'Integration required (like KDE Connect)', 'info')
                            }
                            if (action === 'sms') {
                                window.location.href = `sms:?body=${encodeURIComponent(url)}`
                            }
                        })
                    })
                }
            })
        }
    })
}

