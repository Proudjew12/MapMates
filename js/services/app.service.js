export const appService = {
    confirm,
    flashMsg
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
    }).then(result => result.isConfirmed)
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
