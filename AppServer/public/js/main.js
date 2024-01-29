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

async function anFetchGet(baseUrl = '', dest = '', paramObj) {
    const fetchUrl = `${baseUrl}${dest}?${(new URLSearchParams(paramObj)).toString()}`;
    const raw = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + getCookie("auth"),
        }
    });
    const data = await raw.json();
    return data;
}
async function anFetchPost(baseUrl = '', dest = '', bodyObj, method = 'POST') {
    const fetchUrl = `${baseUrl}${dest}`;
    const raw = await fetch(fetchUrl, {
        method: method,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getCookie("auth"),
        },
        body: JSON.stringify(bodyObj),
    });
    if (!raw.ok) {
        throw new Error(`HTTP error! Status: ${raw.status}`);
    }
    const data = await raw.json();
    return data;
}

async function xuanFetchGet(baseUrl) {
    const fetchUrl = `${baseUrl}`;
    const raw = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + getCookie("auth"),
        }
    });
    return raw;
}
async function xuanFetchPost(baseUrl, bodyObj, method = 'POST') {
    const fetchUrl = `${baseUrl}`;
    const raw = await fetch(fetchUrl, {
        method: method,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getCookie("auth"),
        },
        body: JSON.stringify(bodyObj),
    });
    return raw;
}



const fetchData = async (url) => {
    try {
        const rs = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + getCookie("auth"),
            }
        });
        if (!rs.ok) return false;
        data = await rs.json();
        return data;
    } catch (error) {
        return false;
    };
}

const fetchPos = async (data, url) => {
    try {
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
    } catch (error) {
        return new Response(null, { status: 500, statusText: "ERR_INTERNET_DISCONNECTED" });
    };
}