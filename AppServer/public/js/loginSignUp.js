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
    if (!checkRegisterForm()) {
        return;
    }
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
        $('.toast-body').append('<p>&#10;&#13;Automatically move to login after 5 seconds.</p>');
        setTimeout(() => {
            changeForm();
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

//validation
const regexs =
{
    username: /^[a-zA-Z0-9_]{3,20}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
    atLeastLower: /^.*[a-z].*$/,
    atLeastUpper: /^.*[A-Z].*$/,
    atLeastDigit: /^.*\d.*$/,
    atLeastSpecial: /^.*[@$!%*?&.].*$/,
    trueChars: /^[A-Za-z\d@$!%*?&.]{8,}$/,
    eightChars: /^.{8,}$/,
    phone: /^0\d{9}$/,
    firstname: /^[A-Za-z]{1,30}$/,
    lastname: /^[A-Za-z]{1,30}$/
}
const messageClass = 'validation-message';

function validate(selector, regex, message) {

    $input = $(selector);
    $input.on('input', function () {
        const value = $(this).val();
        if ((regex.test(value) && $($(this).next()).hasClass(messageClass)) || value.length == 0) {
            $(this).siblings(`.${messageClass}`).remove();
        }
        else if (!regex.test(value) && !$($(this).next()).hasClass(messageClass)) {
            $(this).after(createMessage(message));
        }
    })
}

function createMessage(message) {
    return `<div class="${messageClass}">*<i>${message}</i></div>`;
}



validate('.validation-username', regexs.username, 'username must start with a letter, includes letters, digits and underscores, from 3 to 20 characters.')
validate('.validation-phone', regexs.phone, 'username must start with 0 and includes 10 digits.')
validate('.validation-firstname', regexs.firstname, 'firstname must start with letter and includes from 1 to 30 letters.')
validate('.validation-lastname', regexs.lastname, 'lastname must start with letter and includes from 1 to 30 letters.')
validatePassword();
validateDOB();

//for dob
function testDOB(value) {
    return new Date(value) < new Date()
}
function validateDOB() {
    $input = $('.validation-dob');
    $input.on('input', function () {
        const value = $(this).val();
        $(this).siblings(`.${messageClass}`).remove();
        if (!testDOB(value)) {
            let content = `
            <div class = 'validation-message'>
                *date of birth must before or equal current date.
            </div>
            `;
            $(this).after(content);
        }
    })
}

//for password
function validatePassword() {
    $input = $('.validation-password');
    $input.on('input', function () {
        const value = $(this).val();
        $(this).siblings(`.${messageClass}`).remove();
        if (!regexs.password.test(value) && value.length != 0) {
            let content = `
            <div class = 'validation-message'>
                password must include: 
                <ul> 
                    <li style="color: ${getColorFromTesting(regexs.atLeastLower, value)};"> at least one lowercase letter</li>
                    <li style="color: ${getColorFromTesting(regexs.atLeastUpper, value)};"> at least one uppercase letter </li>
                    <li style="color: ${getColorFromTesting(regexs.atLeastDigit, value)};"> at least one digit</li>
                    <li style="color: ${getColorFromTesting(regexs.atLeastSpecial, value)};"> at least one special character </li>
                    <li style="color: ${getColorFromTesting(regexs.eightChars, value)};"> the total length of the string is at least 8 characters </li>
                    <li style="color: ${getColorFromTesting(regexs.trueChars, value)};"> can include letters, digits, and the specified special characters.</li>
                </ul>
            </div>
            `;
            $(this).after(content);
        }
    })
}

function getColorFromTesting(regex, input) {
    if (regex.test(input)) {
        return 'green';
    }
    return 'red';
}

function checkRegisterForm() {
    const res = regexs.username.test($('#signupUsername').val())
        && regexs.password.test($('#signupPassword').val())
        && regexs.firstname.test($('#firstname').val())
        && regexs.lastname.test($('#lastname').val())
        && regexs.phone.test($('#phonenumber').val())
        && testDOB($('#dob').val());
    return res;
}

function checkLoginForm() {
    const res = regexs.username.test($('#loginUsername').val())
        && regexs.password.test($('#loginPassword').val())
    return res;
}