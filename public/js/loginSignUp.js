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

    // $rememberChbx = $($('form input[type="checkbox"]')[0]);
    // let isRemember = ($rememberChbx.prop('checked') == true ? 'true' : 'false');

    // const Url = '/login';
    // const postData = {
    //     Username: $('#loginUsername').val(),
    //     Password: $('#loginPassword').val(),
    //     Remember: isRemember
    // };

    // fetch(Url, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(postData)
    // })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`Network response was not ok, status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         if (data.success) {
    //             window.location.href = data.redirect;
    //         } else {
    //             $('#loginMessage .message').text(data.message);
    //             $('#loginMessage').toggle();
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error during fetch operation:', error);
    //     });
});

if ($('#loginMessage .message').text()) {
    $('#loginMessage').toggle();
}

if (typeof isRegister !== 'undefined') {
    if (isRegister) {
        changeForm();
    }

}
