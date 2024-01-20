let inputCarPlate = $('#inputCarPlate');
let registerButton = $('#registerButton');
let successAlert = $('#successAlert');
let overplay = $('#overplay');
let failedAlert = $('#failedAlert');
let tbBody = $('#tbBody');
let paymentAlert = $('#paymentAlert');
let confirmPaymentButton = $('#confirmPaymentButton');

confirmPaymentButton.on('click', () => {
    window.location.assign(`/repairservice`);
})

const validation = () => {
    if (inputCarPlate.val() != null && inputCarPlate.val() != '') return true;;
    inputCarPlate.addClass('border border-danger text-danger errMss');
    inputCarPlate.attr('placeholder', 'Please enter your car-plate');
    return false;
}

inputCarPlate.on('click', ((e) => {
    inputCarPlate.attr('68K2-XXXXX');
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
    console.log(fixedCar);
    let index = $('.recordInfo').length;
    console.log(index);
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
                                <button class="paymentButton btn btn-${record.pay == true ? `success` : `primary`} w-75"  ${record.status != `done` || record.pay == true ? `disabled` : ``} href="#" role="button">${record.pay == true && record.status == `done` ? "Completed" : "Pay"}</button>
                            </td>
                        </tr>
            `)
            index += 1;
        }
    }
    let paymentButton = $('.paymentButton');
    paymentButton.on('click',function (e) {
        e.stopPropagation();
        overplay.removeClass('d-none');
        paymentAlert.removeClass('d-none');
        paymentAlert.css('opacity',1);
    })
    let recordInfo = $('.recordInfo');
    recordInfo.on('click',function (e) {
        window.location.assign(`/repairservice/detail?id=${$(this).attr('recordId')}`);
    })
}

generateTable();