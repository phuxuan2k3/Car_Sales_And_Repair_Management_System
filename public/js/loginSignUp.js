let content = $('.content')
let loginContent = $('.loginContent')
let signupContent = $('.signupContent')
let createAccountLink = $('.createAccountLink');
let carousel = $('.carousel');

const changeForm = (e) => {
    carousel.toggleClass('carouselSignup');
    content.toggleClass('changeToSignup hidden');
    setTimeout(() => {
        loginContent.toggleClass('d-none');
        signupContent.toggleClass('d-none');
        content.toggleClass('hidden');
    }, 600)

}

$('.loginForm').on('submit', function (e) {
    $rememberChbx = $($('form input[type="checkbox"]')[0]);
    $rememberChbx.val($rememberChbx.prop('checked') == true ? 'true' : 'false');
});

if ($('#loginMessage .message').text()) {
    $('#loginMessage').toggle();
}

if (typeof isRegister !== 'undefined') {
    if (isRegister) {
        changeForm();
    }
}

$('#registerForm').on('submit', async function (e) {
    e.preventDefault();
    const url = '/api/user/register';
    const data = $('#registerForm').serializeArray().reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        displayRegisterResult(result);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
})

function displayRegisterResult(result) {
    $('.toast-body').text(result.message);
    if (result.success) {
        $('.toast-header').css('background-color', 'green');
        $('.toast-body').append('<p>&#10;&#13;Automatically move to login after 2 seconds.</p>');
        setTimeout(() => {
            changeForm();
        }, 2000);
    } else {
        $('.toast-header').css('background-color', 'red');
    }
    let toast = document.querySelector('.toast');
    if (toast) {
        let myToast = new bootstrap.Toast(toast);
        myToast.show();
    }
}
