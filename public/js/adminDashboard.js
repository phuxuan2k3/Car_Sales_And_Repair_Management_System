const url = 'http://127.0.0.1:3000/api/admin';
let UserContent = $('#UserContent');

async function fetchGet(dest, paramObj) {
    const fetchUrl = `${url}${dest}?${(new URLSearchParams(paramObj)).toString()}`;
    console.log(fetchUrl);
    const raw = await fetch(fetchUrl);
    const data = await raw.json();
    return data;
}

function loadData(users) {
    for (const user of users) {
        UserContent.append(
            /*html*/
            `
            <tr data-id="${user.id}">
                <td>${user.firstname}</td>
                <td>${user.lastname}</td>
                <td>${user.username}</td>
                <td>${user.address}</td>
                <td>${user.permission}</td>
            </tr>
            `
        );
    }
}

$(async () => {
    const users = await fetchGet('/all',);
    loadData(users);
});

