$(function () {
    $('form').on('submit', function (e) {
        $rememberChbx = $($('form input[type="checkbox"]')[0]);
        $rememberChbx.val($rememberChbx.prop('checked') == true ? 'true' : 'false');
        console.log($rememberChbx.val());
    });
});
