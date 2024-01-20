let inputCarPlate = $('#inputCarPlate');
let registerButton = $('#registerButton');
let successAlert = $('#successAlert');
let overplay = $('#overplay');
let failedAlert = $('#failedAlert');
let tbBody = $('#tbBody');
let paymentAlert = $('#paymentAlert');
let paymentInfo = $('#paymentInfo');
let confirmPaymentButton = $('#confirmPaymentButton');
let cancelButton = $('#cancelButton');
let backButton = $('#backButton')
let spinner = $('#spinner');
let amount;
let recordId;
let successTransaction = $('#successTransaction');
let falseTransaction = $('#falseTransaction');

const paymentChangeStyle = () => {
}

confirmPaymentButton.on('click', async () => {
    spinner.removeClass('d-none');
    paymentInfo.addClass('d-none');
    confirmPaymentButton.addClass('d-none');
    cancelButton.addClass('d-none')
    const transactionData = {
        from: userId,
        to: 440,
        amount: parseFloat(amount),
        content: "Repair service - SGXAUTO"
    }
    const serverResponse = await fetch('http://localhost:3001/transaction', {
        method: 'post',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(transactionData)
    })
    spinner.addClass('d-none');
    backButton.removeClass('d-none')
    if (serverResponse.ok) {
        successTransaction.removeClass('d-none');
        const data = {
            fixrecord_id: recordId,
            pay: true
        }
        const rs = await fetch('api/cfix/update-pay', {
        method: 'post',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    } else {
        falseTransaction.removeClass('d-none');
    }
})

cancelButton.on('click', () => {
    overplay.addClass('d-none');
    paymentAlert.addClass('d-none');
    paymentAlert.css('opacity', 0);
})

backButton.on('click',() => {
    window.location.assign(`/repairservice`);
})

const validation = () => {
    if (inputCarPlate.val() != null && inputCarPlate.val() != '') return true;;
    inputCarPlate.addClass('border border-danger text-danger errMss');
    inputCarPlate.attr('placeholder', 'Please enter your car-plate');
    return false;
}

inputCarPlate.on('click', ((e) => {
    inputCarPlate.attr('placeholder', '68K2-XXXXX');
    inputCarPlate.removeClass('border border-danger text-danger errMss');
}))

registerButton.click(async (e) => {
    e.preventDefault();
    if (validation() == true) {
        const entity = {
            car_plate: inputCarPlate.val(),
            id: userId
        }
        const serverResponse = await fetch('/api/car/fixed/add', {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(entity)
        })
        if (serverResponse.ok) {
            overplay.removeClass('d-none');
            successAlert.removeClass('d-none');
            successAlert.css('opacity', 1);
        } else {
            overplay.removeClass('d-none');
            failedAlert.removeClass('d-none');
            failedAlert.css('opacity', 1);
        }
    }
})

const generateTable = async () => {
    let rs = await fetch(`/api/car/fixed/find?id=${userId}`);
    const fixedCar = await rs.json();
    let index = $('.recordInfo').length;
    for (const car of fixedCar) {
        rs = await fetch(`/api/cfix/car-plate?car_plate=${car.car_plate}`);
        const records = (await rs.json()).fixRecords;
        for (const record of records) {
            tbBody.append(`
                        <tr class="text-center recordInfo" recordId="${record.fixrecord_id}">
                            <td scope="col">${index + 1}</td>
                            <td scope="col">${record.car_plate}</td>
                            <td scope="col">${record.date}</td>
                            <td scope="col">${record.total_price}</td>
                            <td scope="col">${record.status}</td>
                            <td scope="col">
                                <button total_price="${record.total_price}" recordId="${record.fixrecord_id}" car_plate="${record.car_plate}" date="${record.date}" class="paymentButton btn btn-${record.pay == true ? `success` : `primary`} w-75"  ${record.status != `done` || record.pay == true ? `disabled` : ``} href="#" role="button">${record.pay == true && record.status == `done` ? "Completed" : "Pay"}</button>
                            </td>
                        </tr>
            `)
            index += 1;
        }
    }
    let paymentButton = $('.paymentButton');
    paymentButton.on('click', async function (e) {
        e.stopPropagation();
        const rs = await fetch(`http://localhost:3001/account?id=${userId}`);
        const account = await rs.json();
        paymentInfo.empty();
        paymentInfo.append(`
            <p>Order ID: ${$(this).attr('recordId')}</p>
            <p>Date: ${$(this).attr('date')}</p>
            <p>Your balance: ${account.balance}</p>
            <p>Total price: ${$(this).attr('total_price')}</p>
        `)
        amount = $(this).attr('total_price');
        recordId = parseInt($(this).attr('recordId'));
        confirmPaymentButton.attr('disabled', (account.balance < parseFloat($(this).attr('total_price')) ? true : false));
        overplay.removeClass('d-none');
        paymentAlert.removeClass('d-none');
        paymentAlert.css('opacity', 1);
    })
    let recordInfo = $('.recordInfo');
    recordInfo.on('click', function (e) {
        window.location.assign(`/repairservice/detail?id=${$(this).attr('recordId')}`);
    })
}

generateTable();