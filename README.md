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

2) API Cần được Authenticate: <br />
Header cần bổ sung: <code>"Authorization": "Bearer " + getCookie("auth")</code>. Với hàm getCookie nằm trong /js/main.js ở thẻ script trong main.hbs (layout), hàm này dùng để lấy cookie từ phía client. Ví dụ:<br />
<code>
async function fetchGet(dest, paramObj) {
    const fetchUrl = `${url}${dest}?${(new URLSearchParams(paramObj)).toString()}`;
    const raw = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + getCookie("auth"),
        }
    });
    const data = await raw.json();
    return data;
}
</code>
<br/>
Còn nếu muốn sửa quyền (authorization) thì vào file api.r.js và sửa tham số của hàm authApi (mảng các quyền dạng chuỗi, VD: ['ad', 'cus']).
