let page = 1;
let per_page = 12;
let carData;
let CurrentMP = $('#CurrentMP')
let maxPriceRange = $('#maxPriceRange');
let YearCheckList = $('#YearCheckList');
let SearchBar = $('#SearchBar')
let CarList = $('#CarList');
let PageInfo = $('#PageInfo');
let brand = 'All';
let type = 'All';
let totalPage;
let popupWindow = $('#popupWindow');
let overlay = $('.overlay');


maxPriceRange.on('input', async (e) => {
    page = 1;
    await updateCarData(page);
    CurrentMP.text(`${maxPriceRange.val()}$`);
    updatePageInfo();
})


const updateData = async () => {
    page = 1;
    await updateCarData(page);
    updatePageInfo();
}

const menuClickEvent = async (carBrand, carType) => {
    console.log(`${brand} ${type}`);
    brand = carBrand != null ? `${carBrand}` : 'All';
    type = carType != null ? `${carType}` : 'All';
    let menuContent = $(`#menuContent`);
    menuContent.text(`${brand} ${type != 'All' ? `: ${type}` : ''}`);
    await updateData();
}

const removeAllCheckBox = async (e) => {
    e.preventDefault();
    let checkedYear = $('.yearOption:checked');
    checkedYear.each((index, e) => {
        $(e).prop('checked', false)
    });
    await updateData();
}

const prePage = async () => {
    if (page <= 1) return;
    page -= 1;
    await updateCarData(page);
    updatePageInfo();
}

const nextPage = async () => {
    if (page >= totalPage) return;
    page += 1;
    await updateCarData(page);
    updatePageInfo();
}


const updateCarData = async (page) => {
    let checkedYear = $('.yearOption:checked')
    let queryElement = [];
    let yearArr = []
    checkedYear.each((index, e) => {
        yearArr.push(`year=${$(e).val()}`);
    });
    if (brand != 'All') queryElement.push(`brand=${brand}`);
    if (type != 'All') queryElement.push(`type=${type}`);
    if (yearArr.length > 0) queryElement.push(yearArr.join('&'));
    if (SearchBar.val() != '') queryElement.push(`search=${SearchBar.val()}`);
    let query = queryElement.join('&');
    let url = `/api/car/car_page?${query}&page=${page}&per_page=${per_page}&max_price=${maxPriceRange.val()}`;
    const rsData = await fetchData(url);
    carData = rsData.data;
    totalPage = rsData.totalPage;
    await generateCarInfo();
}

const backEvent = async () => {
    overlay.toggleClass('d-none');
    popupWindow.toggleClass('d-none');
}

const confirmAddEvent = async (carId, cartQuantity, event) => {
    event.preventDefault();
    let popupContent = $('#popupContent');
    let quantityInput = $('#quantityInput');
    let redirectToCartButton = $('#redirectToCartButton');
    let confirmAdd = $('#confirmAdd');
    redirectToCartButton.toggleClass('d-none');
    confirmAdd.toggleClass('d-none');
    popupContent.empty();
    const currentCar = await fetchData(`/api/car/find?id=${carId}`);
    const quantity = parseInt(quantityInput.val());
    if (quantity <= currentCar.quantity) {
        const entity = {
            "customer_ID": userId,
            "car_ID": carId,
            "quantity": cartQuantity != null ? quantity + cartQuantity : quantity
        }
        const url = cartQuantity == null ? `/api/cart/add` : `/api/cart/update_quantity`
        const rs = await fetchPos(entity, url);
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
                <p class=" text-center fs-3 textPrimary">Failed to add the product to the cart. (The quantity of the selected item has changed!)<i class="fa-regular fa-face-sad-cry"></i></p>
            </div>
        `)
    }
}


const redirectToCartEvent = async () => {
    window.location.assign('/cart')
}

const setAddToCartEvent = async (userId, car) => {
    const cartData = await fetchData(`/api/cart/find?customer_ID=${userId}&car_ID=${car.id}`);
    let maxQuantity = cartData != null ? car.quantity - cartData[0].quantity : car.quantity
    overlay.toggleClass('d-none');
    popupWindow.toggleClass('d-none');
    popupWindow.empty();
    popupWindow.append(`
    <form  action="#" onsubmit="confirmAddEvent(${car.id},${cartData != null ? cartData[0].quantity : null},event)" class="alert w-50 alert-light position-fixed z-3 top-50 start-50 translate-middle " id="paymentAlert" role="alert">
            <h4 class="alert-heading"><i class="me-3 fa-solid fa-cart-plus" style="color: #74C0FC;"></i> ADD TO CART</h4>
            <hr>
            <div id="popupContent">
                <p>Car name: ${car.name}</p>
                <p>Type: ${car.type}</p>
                <p>Price: ${car.price}$</p>
                <p>Storage : ${car.quantity}</p>
                ${cartData != null ? `
                <p>Number of items in the shopping cart: ${cartData[0].quantity}</p>
                ` : ''}
                <div class="${maxQuantity <= 0 ? 'd-none' : ''} d-flex flex-row align-items-center">
                    <label class="me-3" for="#quantityInput">Enter quantity: </label>
                    <input class="text-center rounded-pill form-control w-25" min="${1}" max="${maxQuantity}" required  type="number" id="quantityInput" value="1">
                </div>
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
            ${maxQuantity <= 0 ? '<p class="text-danger">You`ve reached the maximum quantity in your cart. !</p>' : ''}
            <button id="confirmAdd"   ${maxQuantity <= 0 ? 'disabled' : ''} class="btn text-light btn-success w-100 mb-3" role="button">ADD</button>
            <a id="redirectToCartButton" onClick="redirectToCartEvent()" class="btn btn-warning w-100 mb-3 d-none"  role="button">Go to cart</a>
            <a id="backButton" onClick="backEvent()" class="btn btn-danger w-100 mb-3"  role="button">Back</a>
            </form>
    `)
}


let carId;

const generateCarInfo = async () => {
    CarList.empty();
    for (const car of carData) {
        CarList.append(`
            <div class="col-lg-4 col-md-6   carInfo mb-3">
                <div class="card ms-auto me-auto mb-3 w-100 h-100 carInfoCard d-flex flex-column">
                    <div class="info" index="${car.id}" >
                        <div class="card-body" style="height:10rem">
                            <p class="card-text fw-bold fs-5 textPrimary mb-0">${car.car_name}</p>
                            <p class="fw-bold fs-8  text-opacity-25 textPrimary opacity4">${car.type}</p>
                        </div>
                        <img src="/images/cars/${car.id}/avatar.png" class="w-100"  style="height: 12rem;"  alt="${car.car_name}.png">  
                        <div class="card-body d-flex flex-row justify-content-between opacity4 textPrimary">
                            <div class="d-flex flex-row align-items-center ">
                                <i class="fa-solid fa-calendar-days"></i>
                                <p class="m-0 ms-1">${car.year}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-body w-100 mt-auto d-flex flex-row justify-content-between align-items-center textPrimary">
                        <div class="fs-5 w-50">${car.price}$</div>
                        <button style="height: 3rem; font-size: 0.7rem" onclick="setAddToCartEvent(${userId},{id: ${car.id},year: ${car.year},type: '${car.type}', quantity: ${car.quantity}, year: ${car.year}, price: ${car.price}, name: '${car.car_name}' })" type="button" ${car.quantity < 1 ? "disabled" : " "} id="buyButton_${car.id}" class="btn buyButton border-0 btn-primary no-wrap  w-50 bgPrimary">
                            ADD TO CART
                        </button>
                    </div>
                </div>
            </div>
        `)
    }
    $('.info').each((index, ele) => {
        $(ele).click((e) => {
            window.location.assign(`/cardetail?id=${$(ele).attr('index')}`)
        })
    })
}

const pageInit = async () => {
    const rsData = await fetchData(`/api/car/car_page?&page=${page}&per_page=${per_page}`)
    carData = rsData.data;
    totalPage = rsData.totalPage;
    await generateCarInfo();
    updatePageInfo();
}

const updatePageInfo = async () => {
    PageInfo.text(`${page}/${totalPage}`)
}


pageInit();