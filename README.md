Đây là file lưu các điều đặc biệt trong phần cài đặt của dự án nhé, anh em cứ thêm số thứ tự như bên dưới rồi viết tiếp

1) nếu muốn truyền biến vào file html để file js có thể sử dụng được thì thêm đoạn code
<code>
{{#if tenbiencantruyen}}
    <script>
        let tenbiencantruyen = {{ tenbiencantruyen }};
    </script>
    {{/if}}
</code>
vào file main.hbs .
Sau đó sử dụng thoải mái ở file js.
Nhớ lúc render thì thêm tenbiencantruyen:giatri vào object truyền.
<br>
2) Thông báo cho dev nào cần:
   <code>
   function displayDeleteResult(result) {
    $('.toast-body').text(result.message);
    if (result.success) {
        $('.toast-header').css('background-color', 'green');
        $('.toast-body').append('<p class="btn btn-success">&#10;&#13;<a href="/car" style="all:unset;color:white">Click here to refresh page.</a></p>');
    } else {
        $('.toast-header').css('background-color', 'red');
    }

    let toast = document.querySelector('.toast');
    if (toast) {
        let myToast = new bootstrap.Toast(toast);
        myToast.show();
    }
}
   </code>
