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

$('input[type="number"]').on('input', function () {
    var inputValue = $(this).val();
    var cleanedValue = inputValue.replace(/\D/g, '');
    $(this).val(cleanedValue);
});



getImgs();

async function getImgs() {
    const id = $($('.edit-form')[0]).data('id');
    const url = `/api/car/imgs/${id}`;
    try {
        const response = await xuanFetchGet(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        var dataSource = result.map(item => `https://localhost:3000/images/cars/${id}/other/` + item);;
        console.log(dataSource);
        let config = dataSource.map((url, index) => ({
            downloadUrl: url,
            width: "120px",
            key: index + 1
        }));

        if (result.length > 0) {
            $("#input-24").fileinput({
                initialPreview: dataSource,
                initialPreviewAsData: true,
                initialPreviewConfig: config,
                showCaption: false,
                showCancel: true,
                showUpload: true,
                maxFileSize: 5000,
                maxFileCount: 10,
                allowedFileExtensions: ['png'],
            });
        } else {
            $("#input-24").fileinput({
                maxFileSize: 5000,
                maxFileCount: 10,
                allowedFileExtensions: ['png', 'jpg'],
                showCaption: false,
                showRemove: false,
                showUpload: true,
                showCancel: true
            });
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}