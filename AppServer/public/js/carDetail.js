let overlay = $('.overlay');
let popupWindow = $('#popupWindow')

$('input[type="number"]').on('input', function () {
    let inputValue = parseInt($(this).val(), 10);
    if (inputValue == '' || null) $(this).val(1);
    let min = parseInt($(this).attr('min'), 10);
    let max = parseInt($(this).attr('max'), 10);
    if (inputValue < min) {
        $(this).val(min);
    } else if (inputValue > max) {
        $(this).val(max);
    }
});

const backToPrePage = async () => {
    window.history.back();
}

const fetchData = async (url) => {
    const rs = await fetch(url);
    data = await rs.json();
    return data;
}

const refreshEvent = async () => 
{
    location.href = location.href;
}

const redirectToCartEvent = async () => {
    window.location.assign('/cart');
}




const confirmAddEvent = async (carId,cartQuantity) => {
    await setAddToCartEvent(userId,carId);
    let popupContent = $('#popupContent');
    let quantityInput = $('#quantityInput');
    let redirectToCartButton = $('#redirectToCartButton');
    let refreshButton = $('#refreshButton');
    redirectToCartButton.toggleClass('d-none');
    refreshButton.toggleClass('d-none');
    popupContent.empty();
    const currentCar = await fetchData(`/api/car/find?id=${carId}`);
    const quantity = parseInt(quantityInput.val());
    console.log(cartQuantity);
    if (quantity <= currentCar.quantity) {
        const entity = {
            "customer_ID": userId,
            "car_ID": carId,
            "quantity":  cartQuantity != null ? quantity + cartQuantity : quantity
        }
        console.log(entity);
        const url = cartQuantity == null ? `/api/cart/add` : `/api/cart/update_quantity`
        const rs = await fetch(url, {
            method: 'post',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(entity)
        })
        if (!rs.ok) {
            popupContent.append(`
            <div id="falseTransaction" class="  d-flex flex-column justify-content-center align-items-center">
                <i class="fa-solid fa-circle-exclamation" style="color: #74C0FC;font-size: 10rem"></i>
                <p class="text-center fs-3 textPrimary">Failed to add the product to the cart. (Something wrong!)<i class="fa-regular fa-face-sad-cry"></i></p>
            </div>
            `)
            return;
        }
        popupContent.append(`
            <div id="successTransaction" class=" d-flex flex-column justify-content-center align-items-center">
                <i class="fa-regular fa-circle-check " style="color: #63E6BE;font-size: 10rem"></i>
                <p class=" text-center fs-3 textPrimary">Product successfully added to the cart! <i class="fa-regular fa-face-grin-hearts"></i></p>
            </div>
        `)
    } else {
        popupContent.append(`
            <div id="falseTransaction" class="  d-flex flex-column justify-content-center align-items-center">
                <i class="fa-solid fa-circle-exclamation" style="color: #74C0FC;font-size: 10rem"></i>
                <p class=" text-center fs-3 textPrimary">Failed to add the product to the cart.<i class="fa-regular fa-face-sad-cry"></i></p>
            </div>
        `)
    }
}



const setAddToCartEvent = async (userId, carId) => {
    overlay.toggleClass('d-none');
    popupWindow.toggleClass('d-none');
    popupWindow.empty();
    popupWindow.append(`
    <div class="alert w-50 alert-light position-fixed z-3 top-50 start-50 translate-middle " id="paymentAlert" role="alert">
            <h4 class="alert-heading"><i class="me-3 fa-solid fa-cart-plus" style="color: #74C0FC;"></i> ADD TO CART</h4>
            <hr>
            <div id="popupContent">
                
            </div>
            <hr>
            <button id="redirectToCartButton" onClick="redirectToCartEvent()" class="btn btn-warning w-100 mb-3 d-none"  role="button">Go to cart</button>
            <button id="refreshButton" onClick="refreshEvent()" class="btn btn-danger w-100 mb-3 d-none"  role="button">Back</button>
            </div>
    `)
}