$('#dashboard').click(() => {
    window.location.href = '/dashboard';
})
$('#car, .close').click(() => {
    window.location.href = '/car';
})
$('#ap').click(() => {
    window.location.href = '/ap';
})

$("#input-id").fileinput({
    maxFileSize: 5000,
    maxFileCount: 1,
    browseClass: "btn btn-info",
    mainClass: "d-grid",
    showCaption: false,
    showRemove: true,
    showUpload: false,
    allowedFileExtensions: ['jpg', 'png'],

});

$("#input-24").fileinput({
    maxFileSize: 5000,
    maxFileCount: 10,
    allowedFileExtensions: ['jpg', 'png'],
});