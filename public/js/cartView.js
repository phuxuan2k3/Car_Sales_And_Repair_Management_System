
let overplay = $('#overplay');
let popupWindow = $('#popupWindow');
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
// event
let mustToPay = $(`#mustToPay`);
let payButton = $(`#payButton`);
let totalPrice = 0;
let spinner;
mustToPay.text(totalPrice);
const checking = async (event) => {
    event.stopPropagation();
}

const getSaleRecordData = async (id) => {
    window.location.assign(`/cart/detail?id=${id}`)
}

const createInvoice = async () => {
    let items = $(`input[type='checkbox']:checked`);
    let car_id_quantity_array = [];
    for (const e of items) {
        let car_ID = parseInt($(e).attr('car_ID'));
        let ourQuantity = parseInt($(`#quantity_${car_ID}_${userId}`).val());
        car_id_quantity_array.push({ car_id: car_ID, quantity: ourQuantity });
    }
    const data = {
        cus_id: userId,
        date: new Date(),
        car_id_quantity_array: car_id_quantity_array
    }
    const rs = await fetch(`/api/csale/add-cart`, {
        method: 'post',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(data)
    })
}
const updateStorage = async () => {
    let items = $(`input[type='checkbox']:checked`);
    for (const e of items) {
        let car_ID = parseInt($(e).attr('car_ID'));
        let ourQuantity = parseInt($(`#quantity_${car_ID}_${userId}`).val());
        const rsf = await fetch(`/api/car/find?id=${car_ID}`)
        const currentCarData = await rsf.json();
        const data = {
            "customer_ID": userId,
            "id": car_ID,
            "quantity": currentCarData.quantity - ourQuantity
        }
        const rs = await fetch(`/api/car/update_quantity`, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(data)
        })
    }
}


const removeCheckedItem = async () => {
    let items = $(`input[type='checkbox']:checked`);
    for (const e of items) {
        let car_ID = parseInt($(e).attr('car_ID'));
        const entity = {
            "customer_ID": userId,
            "car_ID": car_ID,
        }
        const rs = await fetch(`/api/cart/delete`, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(entity)
        })
    }
}

const deleteCartItem = async (car_ID, event) => {
    event.stopPropagation();
    const entity = {
        "customer_ID": userId,
        "car_ID": car_ID,
    }
    const rs = await fetch(`/api/cart/delete`, {
        method: 'post',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(entity)
    })
    location.href = location.href;
}


const updateTotalPrice = async () => {
    totalPrice = 0;
    let items = $(`input[type='checkbox']:checked`);
    for (const e of items) {
        let car_ID = parseInt($(e).attr('car_ID'));
        let price = parseFloat($(`#cartItemPrice_${car_ID}`).text());
        totalPrice += price;
    }
    mustToPay.text(`${totalPrice}`)
}


const cartItemClick = async (car_ID, itemPrice, event) => {
    event.stopPropagation();
    let checkbox = $(`#checkBox_${car_ID}_${userId}`);
    if (checkbox.prop('checked')) {
        checkbox.prop('checked', false);
    } else {
        checkbox.prop('checked', true);
    }
    updateTotalPrice();
    payButton.attr('disabled', totalPrice <= 0 ? true : false);
}

const blurEvent = async (car_ID) => {
    let ele = $(`#quantity_${car_ID}_${userId}`);
    if (isNaN(parseInt(ele.val()))) ele.val(ele.attr('preQuantity'));
}

const quantityInput = async (car_ID, storageQuantity, price, event) => {
    event.stopPropagation();
    let ele = $(`#quantity_${car_ID}_${userId}`);
    let inputVal = parseInt(ele.val());
    let cartItem = $(`#cartItem_${car_ID}_${userId}`)
    let errorNotify = $(`#errorNotify_${car_ID}`);
    let cartItemPrice = $(`#cartItemPrice_${car_ID}`);
    if (!isNaN(inputVal)) {
        let max = parseInt(ele.attr('max'), 10);
        let min = parseInt(ele.attr('min'), 10);
        if (inputVal < min) {
            ele.val(min);
        } else if (inputVal > max) {
            ele.val(max);
        }
        inputVal = ele.val();
        cartItem.removeClass('disabled_item');
        errorNotify.addClass('d-none');
        const entity = {
            "customer_ID": userId,
            "car_ID": car_ID,
            "quantity": inputVal
        }
        const rs = await fetch(`/api/cart/update_quantity`, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(entity)
        })
        ele.attr('preQuantity', ele.val());
    }
    console.log(ele.attr('preQuantity'));
    cartItemPrice.text(`${parseInt(ele.attr('preQuantity')) * price}$`)
    updateTotalPrice();
}

const check = async () => {
    let rs = true;
    let items = $(`input[type='checkbox']:checked`);
    for (const e of items) {
        let car_ID = parseInt($(e).attr('car_ID'));
        let ourQuantity = parseInt($(`#quantity_${car_ID}_${userId}`).val());
        const rsf = await fetch(`/api/car/find?id=${car_ID}`)
        const currentCarData = await rsf.json();
        if (ourQuantity > currentCarData.quantity || currentCarData.quantity <= 0) rs = false;
    }
    return rs;
}

payButton.on('click', async (e) => {
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
        <button id="backButton" class="btn btn-info w-100 mb-3 d-none"  role="button">Back cart page</button>
        </div>
        `)
    spinner = $('#spinner')
    confirmPaymentButton = $('#confirmPaymentButton');
    successTransaction = $('#successTransaction');
    falseTransaction = $('#falseTransaction');
    cancelButton = $('#cancelButton');
    paymentAlert = $('#paymentAlert');
    paymentAlert.css('opacity', 1)
    paymentInfo = $('#paymentInfo');
    const rs = await fetch(`http://localhost:3000/api/payment/account`);
    const account = await rs.json();
    paymentInfo.empty();
    let date = new Date();
    paymentInfo.append(`
        <p>Date: ${date}</p>
        <p>Your balance: ${account.balance}$</p>
        <p>Total price: ${parseFloat($('#mustToPay').text())}$</p>
    `)
    const amount = parseFloat($('#mustToPay').text());
    confirmPaymentButton.attr('disabled', (account.balance < amount ? true : false));
    paymentAlert.css('opacity', 1);
    cancelButton.on('click', () => {
        overplay.addClass('d-none');
        popupWindow.addClass('d-none');
        paymentAlert.css('opacity', 0);
    })
    backButton = $('#backButton');
    backButton.on('click', () => {
        window.location.assign(`/cart`);
    });
    confirmPaymentButton.on('click', async () => {
        spinner.removeClass('d-none');
        paymentInfo.addClass('d-none');
        confirmPaymentButton.addClass('d-none');
        cancelButton.addClass('d-none')
        const transactionData = {
            from: userId,
            to: adminId,
            amount: amount,
            content: "Buy car - SGXAUTO"
        }
        let checkRs = await check();
        if (checkRs) {
            const serverResponse = await fetch('api/payment/transfer', {
                method: 'post',
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow",
                body: JSON.stringify(transactionData)
            })
            spinner.addClass('d-none');
            backButton.removeClass('d-none');
            if (serverResponse.ok) {
                successTransaction.removeClass('d-none');
                //to do some thing here
                await createInvoice();
                await updateStorage();
                await removeCheckedItem();
            } else {
                falseTransaction.removeClass('d-none');
            }
        } else {
            spinner.addClass('d-none');
            backButton.removeClass('d-none');
            falseTransaction.removeClass('d-none');
        }
    })
})
