$('#dashboard').on('click', () => {
    window.location.href = '/dashboard';
})
$('#car').on('click', () => {
    window.location.href = '/car';
})
$('#ap').on('click', () => {
    window.location.href = '/ap';
})
$('#brand').on('click', () => {
    window.location.href = '/brand';
})
$('#type').on('click', () => {
    window.location.href = '/type';
})

$('.delete').on('click', async function (e) {

    const brand = $(e.target).data('type');
    console.log($(e.target));
    const url = `/type/delete/${brand}`;
    $('#sureDelete').on('click', async () => {
        try {
            const response = await xuanFetchGet(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            window.location.href = '/type';
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    })
})