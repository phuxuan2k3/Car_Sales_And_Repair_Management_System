const url = 'http://127.0.0.1:3000/api/admin';

async function fetchGet(dest, paramObj) {
    const fetchUrl = `${url}${dest}?${(new URLSearchParams(paramObj)).toString()}`;
    const raw = await fetch(fetchUrl);
    const data = await raw.json();
    return data;
}
async function fetchPost(dest, bodyObj) {
    const fetchUrl = `${url}${dest}`;
    const raw = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(bodyObj),
    });
    const data = await raw.json();
    return data;
}

// data
// storage
let loading = false;
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
    },
    currentUserId: null,
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
    if (loading === true) return;
    loading = true;
    // scroll preserve
    localStorage.setItem('scrollpos', window.scrollY);
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
                <td>${permissionMapper[user.permission]}</td>
                <td>
                    <div class="row gy-md-0 gy-2">
                        <div class="col-auto">
                            <button onclick="toggleContent('form', ${user.id})" class="btn outlineDanger px-2"><i class="fa-solid fa-pen"></i></button>
                        </div>
                        <div class="col-auto">
                            <button onclick="toggleContent('modal', ${user.id})" 
                                data-bs-toggle="modal" data-bs-target="#deleteModal"
                                class="btn inlineDanger px-2"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </td>
            </tr>
            `
        );
    }
    const totalUsers = await fetchGet('/count-custom', { username: custom.username, permission: custom.permission });
    storage.totalPage = Math.ceil((parseInt(totalUsers) || 0) / custom.perPage);
    if (storage.page > storage.totalPage) {
        storage.page = storage.totalPage;
    }
    await loadPagination();
    // scroll preserve
    var scrollpos = localStorage.getItem('scrollpos');
    if (scrollpos) window.scrollTo(0, scrollpos);
    loading = false;
}
const loadPagination = async () => {
    paginationContainer().children().not(':first').not(':last').remove();
    // config paging
    const sRange = 2;
    const eRange = 2;
    const curRange = 2;
    // item types
    const tripleDotsItem =
        `<li class="page-item">
            <span class="page-link"
                style="user-select: none;">
                ...
            </span>
        </li>`;
    const currentPageItem = (i) =>
        `<li class="page-item active">
            <span class="page-link"
                style = "user-select: none;" >
                ${i}
            </span>
        </li>`;
    const normalPageItem = (i) =>
        `<li class="page-item" onclick="setPage(${i})">
            <a class="page-link"
                href="#/">
                ${i}
            </a>
        </li>`;
    const totalPage = storage.totalPage;
    const currentPage = storage.page;
    let goToEndDotsPosition = false;
    for (let i = 1; i <= totalPage;) {
        let pageItem = '';
        if (i <= sRange || i >= currentPage - curRange && i <= currentPage + curRange || i >= totalPage - eRange + 1) {
            if (i >= currentPage - curRange && i <= currentPage + curRange) {
                goToEndDotsPosition = true;
            }
            pageItem = i === currentPage ? currentPageItem(i) : normalPageItem(i);
            i++;
        }
        else {
            pageItem = tripleDotsItem;
            i = goToEndDotsPosition ? totalPage - eRange + 1 : currentPage - curRange;
        }
        $(pageItem).insertBefore(paginationContainer().children().last());
    }
}
const loadForm = async () => {
    if (storage.currentUserId != null) {
        const {
            username,
            password,
            permission,
            firstname,
            phonenumber,
            dob,
            address,
            lastname } = await fetchGet('/single', { id: storage.currentUserId });
        $('#Username').val(username);
        $('#Password').val(password);
        $(`input[name=permission][value=${permission}]`).prop('checked', true)
        $('#Firstname').val(firstname);
        $('#Phonenumber').val(phonenumber);
        $('#Dob').val(dateToString(dob));
        $('#Address').val(address);
        $('#Lastname').val(lastname);
    } else {
        $('#Username').val('');
        $('#Password').val('');
        $(`input[name=permission][value=cus]`).prop('checked', true)
        $('#Firstname').val('');
        $('#Phonenumber').val('');
        $('#Dob').val(dateToString(new Date()));
        $('#Address').val('');
        $('#Lastname').val('');
    }
}
function dateToString(date) {
    let d = new Date(date);
    let day = ("0" + d.getDate()).slice(-2);
    let month = ("0" + (d.getMonth() + 1)).slice(-2);
    let today = d.getFullYear() + "-" + (month) + "-" + (day);
    return today;
}

function formSerializeCombine(formJquery) {
    const res = {};
    const serArray = formJquery.serializeArray();
    for (const obj of serArray) {
        res[obj.name] = obj.value;
    }
    return res;
}

const loadDeleteModal = () => {
    if (storage.currentUserId == null) {
        return;
    }
    const id = storage.currentUserId;
    const data = {
        firstname: '',
        lastname: '',
        username: '',
        permission: '',
    };
    $('#userContent tr').each((i, e) => {
        if ($(e).data('id') == id) {
            data.firstname = $(e).find('td').eq(0).text();
            data.lastname = $(e).find('td').eq(1).text();
            data.username = $(e).find('td').eq(2).text();
            data.permission = $(e).find('td').eq(3).text();
            return;
        }
    });
    const content =
        `<div class="row">
            <div class="col-6">
                <p>Username: <span class="fw-bold">${data.username}</span></p>
            </div>
            <div class="col-6">
                <p>Permission: <span class="fw-bold">${data.permission}</span></p>
            </div>
            <div class="col-6">
                <p>First name: <span class="fw-bold">${data.firstname}</span></p>
            </div>
            <div class="col-6">
                <p>Last name: <span class="fw-bold">${data.lastname}</span></p>
            </div>
        </div>`;
    $('#deleteModalContent').html(content);
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
    await loadUserContent();
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
function perPageInputControlTrigger(control) {
    const val = parseInt(control.value) || 0;
    const max = parseInt(control.max);
    const min = parseInt(control.min);
    if (val < min) {
        control.value = min;
    }
    else if (val > max) {
        control.value = max;
    }
}
async function formSubmit() {
    let form = document.getElementById('detailForm');
    if (form.checkValidity() == false) {
        form.reportValidity();
        return;
    }
    const bodyObj = formSerializeCombine($('#detailForm'));
    let dest = null;
    let res = false;
    // insert
    if (storage.currentUserId == null) {
        let username = $('#Username').val();
        const check = await fetchPost('/check-username', { username });
        console.log(check);
        if (check == true) {
            displayToastResult(false, 'Username already exists');
            return;
        }
        dest = '/insert';
        const fres = await fetchPost(dest, bodyObj);
        if (fres != null) {
            res = true;
        }
    }
    // update
    else {
        dest = '/update';
        bodyObj.id = storage.currentUserId;
        const fres = await fetchPost(dest, bodyObj);
        if (parseInt(fres) != NaN || parseInt(fres) > 0) {
            res = true;
        }
    }
    cudResultDisplay(res);
    toggleContent('table');
}
async function modalDeleteAccept() {
    const result = await fetchPost('/delete', { id: storage.currentUserId });
    cudResultDisplay(result);
    toggleContent('table');
}
async function toggleContent(content, id = null) {
    if (id != null) {
        storage.currentUserId = id;
        $('#formHeader').text('Update').addClass('textDanger').removeClass('textPrimary');
        $('#Username').prop('disabled', true);
    } else {
        storage.currentUserId = null;
        $('#formHeader').text('Add new').removeClass('textDanger`').addClass('textPrimary');
        $('#Username').prop('disabled', false);
    }
    if (content === 'form') {
        $('#tableContainer').addClass('slideLeft');
        $('#formContainer').removeClass('slideRight');
        await loadForm();
    } else if (content === 'table') {
        $('#tableContainer').removeClass('slideLeft');
        $('#formContainer').addClass('slideRight');
        await loadUserContent();
    } else if (content === 'modal') {
        loadDeleteModal();
    }
}
// helper
function cudResultDisplay(result) {
    if (result) {
        displayToastResult(true, 'Action succeed');
    } else {
        displayToastResult(false, 'No action taken');
    }
}
function displayToastResult(success, message) {
    $('.toast-body').text(message);
    if (success) {
        $('.toast-header').addClass('inlinePrimary').removeClass('inlineDanger').find('p').text('Success');
    } else {
        $('.toast-header').addClass('inlineDanger').removeClass('inlinePrimary').find('p').text('Warning');
    }
    $('.toast-body').text(message);
    let toast = document.querySelector('.toast');
    if (toast) {
        let myToast = new bootstrap.Toast(toast);
        myToast.show();
    }
}
const permissionMapper = {
    cus: 'Customer',
    mec: 'Mechanic',
    sm: 'Storage manager',
    sa: 'Sale',
}