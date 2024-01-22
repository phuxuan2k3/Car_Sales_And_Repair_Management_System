const url = 'http://127.0.0.1:3000/api/admin';

async function fetchGet(dest, paramObj) {
    const fetchUrl = `${url}${dest}?${(new URLSearchParams(paramObj)).toString()}`;
    console.log(fetchUrl);
    const raw = await fetch(fetchUrl);
    const data = await raw.json();
    return data;
}

// data
// storage
let storage = {
    totalPage: 0,
    _page: 1,
    get page() { return this._page },
    set page(value) {
        this._page = value;
        if (this._page > this.totalPage) {
            this._page = this.totalPage;
        } else if (this._page < 1) {
            this._page = 1;
        }
        loadUserContent();
    }
}
// trigger

// control
// storage
const userContent = () => $('#userContent');
const paginationContainer = () => $('#paginationContainer');

// trigger
const perPageInput = () => $('#perPageInput');
const searchInput = () => $('#searchInput');
const permissionsContainer = () => $('#permissionsContainer');

// call back
// retriver
const permission = () => permissionsContainer().find('.active').data('permission');
const username = () => searchInput().val();
const perPage = () => parseInt(perPageInput().val()) || 0;

// loader
const loadUserContent = async () => {
    userContent().children().empty();
    const custom = {
        username: username(),
        permission: permission(),
        perPage: perPage(),
        page: storage.page,
    };
    const users = await fetchGet('/custom', custom);
    for (const user of users) {
        userContent().append(
            /*html*/
            `
            <tr data-id="${user.id}">
                <td>${user.firstname}</td>
                <td>${user.lastname}</td>
                <td>${user.username}</td>
                <td>${user.permission}</td>
                <td>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-warning mx-2 px-2"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger mx-2 px-2"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
            `
        );
    }
    storage.totalPage = Math.floor(users.length / custom.perPage) + 1;
    await loadPagination();
}

const loadPagination = async () => {
    paginationContainer().children().not(':first').not(':last').remove();
    for (let i = 1; i <= storage.totalPage; i++) {
        const active = i === storage._page ? 'active' : '';
        const pageLink = i === storage._page ?
            `<span class="page-link"
                style="user-select: none;">
                ${i}
            </span>`:
            `<a class="page-link"
                href="#/"
                click="setPage(${i})">
                ${i}
            </a>` ;
        const pageItem =
            /*html*/
            `<li class="page-item ${active}">
                ${pageLink}
            </li>`;
        $(pageItem).insertBefore(paginationContainer().children().last());
    }
}

// events
const events = () => {
    permissionsContainer().children('button').on('click', async () => await loadUserContent());
    searchInput().on('input', async () => await loadUserContent());
    perPageInput().on('change', async () => await loadUserContent());
}

// main
$(async () => {
    events();
    loadUserContent();
});

// inline functions
function incrPage() {
    storage.page += 1;
}
function decrPage() {
    storage.page -= 1;
}
function setPage(value) {
    storage.page = value;
}
function toggleContent(content) {
    if (content === 'form') {
        $('#tableContainer').addClass('slideLeft');
        $('#formContainer').removeClass('slideRight');
    } else if (content === 'table') {
        $('#tableContainer').removeClass('slideLeft');
        $('#formContainer').addClass('slideRight');
    }
}