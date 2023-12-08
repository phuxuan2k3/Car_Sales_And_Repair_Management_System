Đây là file lưu các điều đặc biệt trong phần cài đặt của dự án nhé, anh em cứ thêm số thứ tự như bên dưới rồi viết tiếp

1) nếu muốn truyền biến vào file html để file js có thể sử dụng được thì thêm đoạn code
{{#if tenbiencantruyen}}
    <script>
        let tenbiencantruyen = {{ tenbiencantruyen }};
    </script>
    {{/if}}
vào file main.hbs .
Sau đó sử dụng thoải mái ở file js.
Nhớ lúc render thì thêm tenbiencantruyen:giatri vào object truyền.