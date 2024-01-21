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



getImgs();

async function getImgs() {
    const id = $($('.edit-form')[0]).data('id');
    const url = `/api/car/imgs/${id}`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        var dataSource = result.map(item => `http://localhost:3000/images/cars/${id}/others/` + item);;
        console.log(dataSource);
        let config = dataSource.map((url, index) => ({
            downloadUrl: url,
            width: "120px",
            key: index + 1
        }));

        $("#input-24").fileinput({
            initialPreview: dataSource,
            initialPreviewAsData: true,
            initialPreviewConfig: config,

            maxFileSize: 5000,
            maxFileCount: 10,
            allowedFileExtensions: ['jpg', 'png'],
        });

        // initialPreview: [url1, url2],
        //     initialPreviewAsData: true,
        //         initialPreviewConfig: [
        //             { caption: "Moon.jpg", downloadUrl: url1, description: "<h5>The Moon</h5>The Moon is Earth's only natural satellite and the fifth largest moon in the solar system. The Moon's distance from Earth is about 240,000 miles (385,000 km).", size: 930321, width: "120px", key: 1 },
        //             { caption: "Earth.jpg", downloadUrl: url2, description: "<h5>The Earth</h5> The Earth is the 3<sup>rd</sup> planet from the Sun and the only astronomical object known to harbor and support life. About 29.2% of Earth's surface is land and remaining 70.8% is covered with water.", size: 1218822, width: "120px", key: 2 }
        //         ],

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}