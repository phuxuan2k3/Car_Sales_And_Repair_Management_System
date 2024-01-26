// $('input[type="number"]').on('input', function () {
//     let inputValue = parseInt($(this).val(), 10);
//     let min = parseInt($(this).attr('min'), 10);
//     let max = parseInt($(this).attr('max'), 10);
//     if (inputValue < min) {
//         $(this).val(min);
//     } else if (inputValue > max) {
//         $(this).val(max);
//     }
// });

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


const fetchData = async (url) => {
    const rs = await fetch(url,{
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + getCookie("auth"),
        }
    });
    if(!rs.ok) return false;
    data = await rs.json();
    return data;
}

const fetchPos = async (data,url) => {
    return await fetch(url, {
        method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getCookie("auth"),
            },
            redirect: "follow",
            body: JSON.stringify(data)
    })
}