let page = 1;
let per_page = 5;
let totalPage = 0
let inputCarPlate = $('#inputCarPlate');
let overplay = $('#overplay');
let tbBody = $('#tbBody');
let showedRecordData = [];
let fixedCar;
let fixRecordsData = [];


//payment
let amount;
let paymentInfo;
let recordId;
let successTransaction = $('#successTransaction');
let falseTransaction = $('#falseTransaction');
//button
let cancelButton = $('#cancelButton');
let backButton = $('#backButton')
let registerButton = $('#registerButton');
let confirmPaymentButton = $('#confirmPaymentButton');
//alert
let spinner = $('#spinner');
let popupWindow = $('#popupWindow');
let paymentAlert = $('#paymentAlert');
let failedAlert = $('#failedAlert');
let successAlert = $('#successAlert');

// Will be fix for jwt


const validation = () => {
    let inputCarPlate = $('#inputCarPlate');
    var regex = /^\d{2}[A-Z]{1}-\d{5}$/;
    var inputString = inputCarPlate.val();
    if (regex.test(inputString)) {
        return true;
    } else {
        inputCarPlate.val('')
        inputCarPlate.addClass('border border-danger text-danger errMss');
        inputCarPlate.attr('placeholder', 'Invalid car-plate');
        return false;
    }
}

const backToPrePage = async () => {
    // window.history.back();
    window.location.assign('/dashboard')
}


inputCarPlate.on('click', ((e) => {
    inputCarPlate.attr('placeholder', '68K-XXXXX');
    inputCarPlate.removeClass('border border-danger text-danger errMss');
}))

registerButton.on('click',async (e) => {
    e.preventDefault();
    if (validation() == true) {
        const entity = {
            car_plate: inputCarPlate.val(),
            id: userId
        }
        console.log(entity)
        const serverResponse = await fetchPos(entity,'/api/car/fixed/add')
        if (serverResponse.ok) {
            overplay.removeClass('d-none');
            popupWindow.empty();
            popupWindow.removeClass('d-none');
            popupWindow.append(`
                <div class="alert alert-light position-fixed z-3 top-50 start-50 translate-middle" id="successAlert"
                    role="alert">
                    <h4 class="alert-heading"><i class="fa-solid fa-circle-check" style="color: #63E6BE;"></i> Well done!</h4>
                    <p> Dear ${nameOfUser},<br>
                        We are pleased to inform you that your repair service registration has been successfully received and
                        processed. Our team is now working to schedule and address your repair needs.
                    </p>
                    <hr>
                    <div class="d-flex flex-row justify-content-between">
                        <p class="mb-0">Best regards, SGX Auto</p>
                        <a name="" id="" class="btn btn-primary" href="/repairservice" role="button">Done</a>
                    </div>
                </div>
            `)
            successAlert = $('#successAlert');
            successAlert.css('opacity', 1);
        } else {
            overplay.removeClass('d-none');
            popupWindow.empty()
            popupWindow.removeClass('d-none');
            popupWindow.append(`
            <div class="alert alert-light position-fixed z-3 top-50 start-50 translate-middle " id="failedAlert"
                role="alert">
                <h4 class="alert-heading"><i class="fa-solid fa-circle-xmark" style="color: #ff0f0f;"></i> Registration Failed</h4>
                <p> Dear ${nameOfUser},<br>
                    We regret to inform you that your attempt to register for repair service was unsuccessful.
                    Please check the information provided and try again. If the issue persists, feel free to contact our support
                    team for assistance.
                </p>
                <hr>
                <div class="d-flex flex-row justify-content-between">
                    <p class="mb-0">Best regards, SGX Auto</p>
                    <a name="" id="" class="btn btn-danger" href="/repairservice" role="button">Back</a>
                </div>
            </div>
            `)
            failedAlert = $('#failedAlert');
            failedAlert.css('opacity', 1);
        }
    }
})


const updateFixRecordData = async () => {
    fixRecordsData = [];
    for (const car of fixedCar) {
        const records = (await fetchData(`/api/cfix/car-plate?car_plate=${car.car_plate}`)).fixRecords;
        for (const record of records) {
            fixRecordsData.push(record);
        }
    }
    if(fixRecordsData.length > per_page) {
        $('.pagination').removeClass('d-none');
        totalPage = Math.ceil(fixRecordsData.length / per_page);
    } else {
        $('.pagination').addClass('d-none');
    }
}

const updateShowedRecordData = async (curPage) => {
    showedRecordData = fixRecordsData.slice((curPage - 1) * per_page,(curPage - 1) * per_page + per_page );
}

const generateTable = async () => {
    tbBody.empty();
    for (const record of showedRecordData) {
        tbBody.append(`
                    <tr class="text-center recordInfo" recordId="${record.fixrecord_id}">
                        <td scope="col">${fixRecordsData.indexOf(record) + 1}</td>
                        <td scope="col">${record.car_plate}</td>
                        <td scope="col">${record.date}</td>
                        <td scope="col">${record.total_price}$</td>
                        <td scope="col">${record.status}</td>
                        <td scope="col">
                            <button total_price="${record.total_price}" recordId="${record.fixrecord_id}" car_plate="${record.car_plate}" date="${record.date}" class="paymentButton btn btn-${record.pay == true ? `success` : `primary`} w-75"  ${record.status != `Done` || record.pay == true ? `disabled` : ``} href="#" role="button">${record.pay == true && record.status == `Done` ? "Completed" : "Pay"}</button>
                        </td>
                    </tr>
        `)
    }
    let paymentButton = $('.paymentButton');
    paymentButton.on('click', async function (e) {
        e.stopPropagation();
        overplay.removeClass('d-none');
        popupWindow.removeClass('d-none');
        popupWindow.empty();
        popupWindow.append(`
        <div class="alert w-50 alert-light position-fixed z-3 top-50 start-50 translate-middle " id="paymentAlert" role="alert">
            <h4 class="alert-heading"><i class="fa-solid fa-credit-card" style="color: #74C0FC;"></i> Payment</h4>
            <hr>
            <div class="row justify-content-center align-items-center d-none" style="height: 200px;" id="spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div id="paymentInfo">
            </div>
            <div id="successTransaction" class="d-none d-flex flex-column justify-content-center align-items-center">
                <i class="fa-regular fa-circle-check " style="color: #63E6BE;font-size: 10rem"></i>
                <p class="fs-3 textPrimary">Successful transaction <i class="fa-regular fa-face-grin-hearts"></i></p>
            </div>
            <div id="falseTransaction" class="d-none d-flex flex-column justify-content-center align-items-center">
                <i class="fa-solid fa-circle-exclamation" style="color: #74C0FC;font-size: 10rem"></i>
                <p class="fs-3 textPrimary">Failed transaction <i class="fa-regular fa-face-sad-cry"></i></p>
            </div>
            <hr>
            <button id="confirmPaymentButton" class="btn text-light btn-warning w-100 mb-3" role="button">Pay</button>
            <button id="cancelButton" class="btn btn-danger w-100 mb-3"  role="button">Cancel</button>
            <button id="backButton" class="btn btn-info w-100 mb-3 d-none"  role="button">Back to service page</button>
            </div>
            `)
        spinner = $('#spinner');
        confirmPaymentButton = $('#confirmPaymentButton');
        successTransaction = $('#successTransaction');
        falseTransaction = $('#falseTransaction');
        cancelButton = $('#cancelButton');
        paymentAlert = $('#paymentAlert');
        paymentAlert.css('opacity', 1);
        paymentInfo = $('#paymentInfo');
        const account = (await fetchData(`/api/payment/account`));
        paymentInfo.empty();
        paymentInfo.append(`
            <p>Order ID: ${$(this).attr('recordId')}</p>
            <p>Date: ${$(this).attr('date')}</p>
            <p>Your balance: ${account.balance}$</p>
            <p>Total price: ${$(this).attr('total_price')}$</p>
        `)
        amount = $(this).attr('total_price');
        recordId = parseInt($(this).attr('recordId'));
        confirmPaymentButton.attr('disabled', (account.balance < parseFloat($(this).attr('total_price')) ? true : false));
        overplay.removeClass('d-none');
        paymentAlert.css('opacity', 1);
        cancelButton.on('click', () => {
            overplay.addClass('d-none');
            popupWindow.addClass('d-none');
            paymentAlert.css('opacity', 0);
        })
        backButton = $('#backButton');
        confirmPaymentButton.on('click', async () => {
            spinner.removeClass('d-none');
            paymentInfo.addClass('d-none');
            confirmPaymentButton.addClass('d-none');
            cancelButton.addClass('d-none')
            const transactionData = {
                from: userId,
                to: adminId,
                amount: parseFloat(amount),
                content: "Repair service - SGXAUTO"
            }
            serverResponse = await fetchPos(transactionData,'/api/payment/transfer');
            spinner.addClass('d-none');
            backButton.removeClass('d-none');
            backButton.on('click', () => {
                window.location.assign(`/repairservice`);
            });
            if (serverResponse.ok) {
                successTransaction.removeClass('d-none');
                const data = {
                    fixrecord_id: recordId,
                    pay: true
                }
                rs = await fetchPos(data,'api/cfix/update-pay')
            } else {
                falseTransaction.removeClass('d-none');
            }
        })
    })
    let recordInfo = $('.recordInfo');
    recordInfo.on('click', function (e) {
        window.location.assign(`/repairservice/detail?id=${$(this).attr('recordId')}`);
    })
}

const init = async () => {
    fixedCar = await fetchData(`/api/car/fixed/find?id=${userId}`)
    await updateFixRecordData();
    await updateShowedRecordData(page);
    await updatePageInfo();
    generateTable();
}

let carPlateInput = $('#carPlateInput');
carPlateInput.on('input', async function (e) {
    const car_plate = $(this).val();
    fixedCar = await fetchData(`/api/car/fixed/find?id=${userId}&car_plate=${car_plate}`);
    page=1;
    await updateFixRecordData();
    await updateShowedRecordData(page);
    await generateTable();
    updatePageInfo();
})


const updatePageInfo = async () => {
    $('#PageInfo').text(`${page}/${totalPage}`)
}

const prePage = async (event) => {
    event.preventDefault();
    if (page <= 1) return;
    page -= 1;
    await updateShowedRecordData(page);
    await generateTable();
    updatePageInfo();
}

const nextPage = async (event) => {
    event.preventDefault();
    if (page >= totalPage) return;
    page += 1;
    await updateShowedRecordData(page);
    await generateTable();
    updatePageInfo();
}

init();

