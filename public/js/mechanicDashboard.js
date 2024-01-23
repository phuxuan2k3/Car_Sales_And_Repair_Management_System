let optionButtons = $('input[name="recordOptionButton"]');
let SearchBar = $('#SearchBar');
let popupWindow = $('#popupWindow');
let overlay = $('.overlay');
let curApID;
let current_record;
let current_status;
//function

const search = (item, searchString) => {
    if (searchString == '' || searchString == null || searchString == undefined) return true;
    let str = `${item.fixrecord_id}${item.car_plate}`
    str = str.toLowerCase();
    return str.includes(searchString.toLowerCase());
}

const drawTable = async (data) => {
    let tbBody = $(`#tbBody`);
    tbBody.empty();
    for (const record of data) {
        tbBody.append(`
                    <tr onclick="updateDetailTable(${record.fixrecord_id},'${record.status}')" class="text-center recordInfo" recordId="${record.fixrecord_id}">
                        <td scope="col">${record.fixrecord_id}</td>
                        <td scope="col">${record.car_plate}</td>
                        <td scope="col">${record.date}</td>
                        <td scope="col">${record.total_price}$</td>
                        <td scope="col" class="${record.status == "Done" ? "text-success" : "text-warning"} fw-bold">${record.status}</td>
                    </tr>
        `)
    }
}

const backEvent = async () => {
    popupWindow.toggleClass('d-none');
    overlay.toggleClass('d-none');
    popupWindow.empty();
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
    await updateDetailTable(current_record, current_status);
};

const addNewDetail = async () => {
    if (current_status == 'Done') return;
    popupWindow.toggleClass('d-none');
    overlay.toggleClass('d-none');
    popupWindow.empty();
    let rs = await fetch(`/api/ap/all`)
    const apData = await rs.json();

    // /ap/detail
    popupWindow.append(`
    <div class="alert w-50 alert-light position-fixed z-3 top-50 start-50 translate-middle " id="paymentAlert" role="alert">
            <h4 class="alert-heading"><i class="me-3 fa-solid fa-plus" style="color: #74C0FC;"></i>ADD DETAIL</h4>
            <hr>
            <form id="inputDetail" action="#"> 
                    <div id="popupContent">
                    <span>Auto part storage: <span id="storage"></span> Price: <span id="apPrice"></span>$</span>
                    <div required class="input-group mb-3">
                        <label class="input-group-text" for="#inputAutoPart">Auto part</label>
                        <select required class="form-select" id="inputAutoPart">
                        </select>
                    </div>
                    <div class="form-outline">
                    <label class="form-label" for="typeNumber">Number input</label>
                    <input value="0" id="inputQuantity" required type="number" id="typeNumber" class="form-control"/>
                    </div>
                    <label for="#detail">Detail</label>
                    <textarea required class="form-control mb-3" placeholder="Enter detail" id="detail" style="height: 100px"></textarea>
                    <hr>
                    <button id="submitButton" class="btn btn-success w-100 mb-3"  role="button">ADD</button>
                </div>
            </form>
        
            <div id="successTransaction" class="d-none d-flex flex-column justify-content-center align-items-center">
                <i class="fa-regular fa-circle-check " style="color: #63E6BE;font-size: 10rem"></i>
                <p class="fs-3 textPrimary">Successful transaction <i class="fa-regular fa-face-grin-hearts"></i></p>
            </div>
            <div id="falseTransaction" class="d-none d-flex flex-column justify-content-center align-items-center">
                <i class="fa-solid fa-circle-exclamation" style="color: #74C0FC;font-size: 10rem"></i>
                <p class="fs-3 textPrimary">Failed transaction <i class="fa-regular fa-face-sad-cry"></i></p>
            </div>
            <button id="backButton" onClick="backEvent()" class="btn btn-danger w-100 mb-3"  role="button">Back</button>
    </div>
    `)
   
    let inputAutoPart = $('#inputAutoPart');

    for (const autoPart of apData) {
        inputAutoPart.append(`<option ap_id="${autoPart.ap_id}" price="${autoPart.price}" quantity="${autoPart.quantity}" value="${autoPart.name}">${autoPart.name}</option>`)
    }
    updateInputQuantityIndex();
  
    inputAutoPart.on('change', async (e) => {
        updateInputQuantityIndex();
    })

    let inputDetail = $('#inputDetail')
    inputDetail.on('submit', async (e) => {
        e.preventDefault();
        let rs = await fetch(`/api/ap/detail?id=${curApID}`);
        const apDetail = (await rs.json())[0];
        let quantity = parseInt($('#inputQuantity').val());
        let apPrice = parseFloat($(`option:selected`).attr('price'));
        console.log(apPrice);
        let detailData = $('#detail').val();
        inputDetail.empty();
        if (quantity > apDetail.quantity) {
            await showError();
        } else {
            // { fixrecord_id, date, detail, price, ap_id, mec_id, Status, quantity }
            const data = {
                fixrecord_id: current_record,
                date: new Date(),
                detail: detailData,
                price: apPrice * quantity,
                ap_id: curApID,
                mec_id: userId,
                Status: 'Ok',
                quantity: quantity
            }
            const newAp = {
                ap_id: curApID,
                quantity: apDetail.quantity - quantity,
            }
            await fetch(`api/cfix/add-detail`, {
                method: 'post',
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                body: JSON.stringify(data)
            })
            await fetch(`api/ap/update-quantity`, {
                method: 'post',
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                body: JSON.stringify(newAp)
            })
            await showSuccess();
        }
    })
}

const updateInputQuantityIndex = () => {
    let submitButton = $(`#submitButton`);
    submitButton.attr('disabled',$(`option:selected`).attr('quantity') <= 0);
    let inputQuantity = $('#inputQuantity');
    let apPrice = $('#apPrice');
    let storage = $('#storage');
    let quantity = parseInt($(`option:selected`).attr('quantity'));
    storage.text(parseInt($(`option:selected`).attr('quantity')))
    apPrice.text(parseInt($(`option:selected`).attr('price')))
    curApID = parseInt($(`option:selected`).attr('ap_id'));
    let min = quantity <= 0 ? 0 : 1;
    let max = quantity <= 0 ? 0 : quantity;
    inputQuantity.attr('min', min);
    inputQuantity.attr('max', max);
}
const showError = async () => {
    $('#falseTransaction').toggleClass('d-none');
}

const showSuccess = async () => {
    $('#successTransaction').toggleClass('d-none');
}

const doneRecord = async () => {
    if (current_status == 'Done') return;
    popupWindow.toggleClass('d-none');
    overlay.toggleClass('d-none');
    popupWindow.empty();
    popupWindow.append(`
    <div class="alert w-50 alert-light position-fixed z-3 top-50 start-50 translate-middle " id="paymentAlert" role="alert">
            <h4 class="alert-heading"><i class="me-3 fa-solid fa-square-check" style="color: #74C0FC;"></i>COMPLETE</h4>
            <hr>
            <div style="height: 20rem" class="d-flex align-items-center text-center justify-content-center" id="popupContent">
                <p class=" fs-3">Are you sure you can complete this repair order?</p>
            </div>
            <div id="successTransaction" class="d-none d-flex flex-column justify-content-center align-items-center">
                <i class="fa-regular fa-circle-check " style="color: #63E6BE;font-size: 10rem"></i>
                <p class="fs-3 textPrimary">Done! <i class="fa-regular fa-face-grin-hearts"></i></p>
            </div>
            <hr>
            <button id="conformDoneButton" onClick="confirmDone()" class="btn btn-success w-100 mb-3"  role="button">YES</button>
            <button id="backButton" onClick="backEvent()" class="btn btn-danger w-100 mb-3"  role="button">NO</button>
            </div>
    `)
    
    // /cfix/update-status-detail
}
const confirmDone = async () => {
    let popupContent = $('#popupContent');
    let conformDoneButton = $('#conformDoneButton');
    let successTransaction = $('#successTransaction');
    const data = {
        fixrecord_id: current_record,
        status: 'Done'
    }
    await fetch(`api/cfix/update-status`,{
        method: 'post',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(data)
    })
    current_status = "Done";
    popupContent.toggleClass('d-none');
    conformDoneButton.toggleClass('d-none');
    successTransaction.toggleClass('d-none');

}





const init = async () => {
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
}

const updateRecordTable = async (option, searchString) => {
    const rs = await fetch('/api/cfix/all');
    let data = (await rs.json()).fixRecords;
    data = option != 'all' ? data.filter(item => item.status === option && search(item, searchString) === true) : data.filter(item => search(item, searchString) === true);
    await drawTable(data);
}

const updateDetailTable = async (recordId, status) => {
    let fixDetail = $('#fixDetail');
    let optionButtonGroup = $('#optionButtonGroup');
    let currentId = $('#currentId');
    currentId.text(recordId);
    current_record = recordId;
    current_status = status;
    let rs = await fetch(`api/cfix/info?fixrecord_id=${recordId}`);
    const data = await rs.json();
    const details = data.fixDetails;
    let detailTbBody = $('#detailTbBody');
    detailTbBody.empty();
    for (const detail of details) {
        rs = await fetch(`api/user/${detail.mec_id}`);
        const mec = await rs.json();
        rs = await fetch(`api/ap/detail?id=${detail.ap_id}`);
        const autoPart = (await rs.json())[0];
        detailTbBody.append(`
            <tr class="text-center">
                <td scope="col">${detail.date}</td>
                <td scope="col">${detail.detail}</td>
                <td scope="col">${mec.lastname}</td>
                <td scope="col">${autoPart.name}</td>
                <td scope="col">${detail.quantity}</td>
                <td scope="col">${autoPart.price}$</td>
                <td scope="col">${detail.price}$</td>
            </tr>
        `)
    }
    if (status != 'Done' || recordId == null || recordId == undefined) {
        optionButtonGroup.removeClass('d-none')
    } else {
        optionButtonGroup.addClass('d-none')
    };
}


//event
optionButtons.on('input', async function (e) {
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
})

SearchBar.on('input', async function (e) {
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
})

//run
init();


