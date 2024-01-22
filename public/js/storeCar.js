$('#dashboard').click(() => {
    window.location.href = '/dashboard';
})
$('#car').click(() => {
    window.location.href = '/car';
})
$('#ap').click(() => {
    window.location.href = '/ap';
})

$('.delete').click(async function (e) {

    const id = $(e.target).data('id');
    console.log($(e.target));
    const url = `api/car`;
    const data = { id };
    $('#sureDelete').click(async () => {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

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
            window.location.href = '/car';
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