$('#dashboard').click(() => {
    window.location.href = '/dashboard';
})
$('#ap, .close').click(() => {
    window.location.href = '/ap';
})
$('#car').click(() => {
    window.location.href = '/car';
})

$('input[type="number"]').on('input', function () {
    var inputValue = $(this).val();
    var cleanedValue = inputValue.replace(/\D/g, '');
    $(this).val(cleanedValue);
});