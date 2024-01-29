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
    const id = $(e.target).data('id');
    console.log($(e.target));
    const url = `api/ap`;
    const data = { id };
    $('#sureDelete').on('click', async () => {
        try {
            const response = await xuanFetchPost(url, data, 'DELETE');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();

            displayDeleteResult(result);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    })
})

function displayDeleteResult(result) {
    $('.toast-body').text(result.message);
    if (result.success) {
        $('.toast-header').css('background-color', 'green');
        $('.toast-body').append('<p">&#10;&#13;We will refresh after 5 seconds<p>');
        setTimeout(() => {
            window.location.href = '/ap';
        }, 5000);
    } else {
        $('.toast-header').css('background-color', 'red');
    }

    let toast = document.querySelector('.toast');
    if (toast) {
        let myToast = new bootstrap.Toast(toast);
        myToast.show();
    }
}