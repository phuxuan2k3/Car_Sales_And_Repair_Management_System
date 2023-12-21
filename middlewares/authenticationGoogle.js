// Các thông tin cần để lấy code
// Đây là key của t và đã chạy được, có thể lấy nó luôn nếu không muốn tạo mới
const ggURL = 'https://accounts.google.com/o/oauth2/v2/auth';
const client_id = '1058157169427-lfobns7gv3pp13md7adtc9g2c3jgg7qn.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uri = 'https://localhost:3000/login/gg/callback'



//middleware đê đăng nhập gg và chuyển trang lấy code
const loginGG = async (req, res, next) => {
    const options = {
        redirect_uri,
        client_id,
        response_type: 'code',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(' '),
    }
    const queries = new URLSearchParams(options)
    res.redirect(`${ggURL}?${queries}`);
}


// middle ware lấy token dựa trên code gửi về từ gg
// gọi middleware này ở router dẫn đến https://localhost:3000/login/gg/callback
const getTokenWithCode = async (req, res, next) => {
    try {
        const code = req.query.code;
        const options = {
            code,
            redirect_uri,
            client_secret,
            client_id,
            grant_type: 'authorization_code'
        }
        const rs = await fetch('https://accounts.google.com/o/oauth2/token', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(options)
        })
        const { id_token, access_token } = await rs.json();
        const userinfo = await getGoogleUser(id_token, access_token)
        // Nơi để tìm kiểm tra user có tồn tại hay không
        // Nếu không thì tạo mới và lưu vào database
        // Sau đó có thể gán thông tin user vào session 
        // redirect đến trang mong muốn
        res.redirect('/mainPage');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    };
}

// hàm lấy dữ liệu từ token có được
const getGoogleUser = async (id_token, access_token) => {
    try {
        const rs = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        })
        const userinfo = await rs.json();
        return userinfo;
    } catch (error) {
        throw error;
    };
}