let page = 1;
let per_page = 6;
let carData;
let typeData;
let brandData;
let CurrentMP = $('#CurrentMP')
let maxPriceRange = $('#maxPriceRange');
let TypeCheckList = $('#TypeCheckList');
let BrandCheckList = $('#BrandCheckList');
let SearchBar = $('#SearchBar')
let CarList = $('#CarList');
let PageInfo = $('#PageInfo');
let totalPage;


maxPriceRange.on('input', async (e) => {
    page = 1;
    await updateCarData();
    CurrentMP.text(`${maxPriceRange.val()}vnđ`);
    updatePageInfo();
})

SearchBar.on('input',async (e) => {
    // console.log(SearchBar.val() != '');
    page = 1;
    await updateCarData();
    CurrentMP.text(`${maxPriceRange.val()}vnđ`);
    updatePageInfo();
})

TypeCheckList.on('input', async (e) => {
    page = 1;
    await updateCarData();
    updatePageInfo();
})

BrandCheckList.on('input', async (e) => {
    page = 1;
    await updateCarData();
    updatePageInfo();
})

const prePage = async () => {
    if (page <= 1) return;
    page -= 1;
    await updateCarData();
    updatePageInfo();
}

const nextPage = async () => {
    if (page >= totalPage) return;
    page += 1;
    await updateCarData();
    updatePageInfo();
}

const fetchData = async (url) => {
    const rs = await fetch(url);
    data = await rs.json();
    return data;
}

const updateCarData = async () => {
    let checkedType = $('.typeOption:checked');
    let checkedBrand = $('.brandOption:checked');
    let queryElement = [];
    let brandArr = [];
    checkedBrand.each((index, e) => {
        brandArr.push(`brand=${$(e).val()}`);
    });
    let typeArr = [];
    checkedType.each((index, e) => {
        typeArr.push(`type=${$(e).val()}`);
    });
    if (brandArr.length > 0) queryElement.push(brandArr.join('&'));
    if (typeArr.length > 0) queryElement.push(typeArr.join('&'));
    if(SearchBar.val() != '') queryElement.push(`search=${SearchBar.val()}`);
    let query = queryElement.join('&');
    let url = `/api/car/car_page?${query}&page=${page}&per_page=${per_page}&max_price=${maxPriceRange.val()}`
    console.log(url);
    const rsData = await fetchData(url);
    carData = rsData.data;
    totalPage = rsData.totalPage;
    await generateCarInfo();
}

const generateCarInfo = async () => {
    CarList.empty();
    for (const car of carData) {
        CarList.append(`
            <div class="carInfo">
                <div class="card ms-4 me-4 mb-3 carInfoCard" style="width: 18rem; height: 25rem">
                    <div class="info" index="${car.id}">
                        <div class="card-body">
                            <p class="card-text fw-bold fs-5 textPrimary mb-0">${car.car_name}</p>
                            <p class="fw-bold fs-8  text-opacity-25 textPrimary opacity4">${car.type}</p>
                        </div>
                            <img src="/images/car.png" class="w-100" alt="...">  
                        <div class="card-body d-flex flex-row justify-content-between opacity4 textPrimary">
                            <div class="d-flex flex-row align-items-center ">
                                <i class="fa-solid fa-calendar-days"></i>
                                <p class="m-0 ms-1">${car.year}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-body d-flex flex-row justify-content-between  textPrimary">
                        <div class="fs-4">${car.price}vnđ</div>
                        <button type="button" ${car.quantity < 1 ? "disabled" : " "} id="buyButton_${car.id}" class="btn border-0 btn-primary bgPrimary">
                            ADD TO CART
                        </button>
                    </div>
                </div>
            </div>
        `)
    }
    $('.info').each((index, ele) => {
        $(ele).click((e) => {
            window.location.assign(`http://localhost:3000/cardetail?id=${$(ele).attr('index')}`)
        })
    })
}

const pageInit = async () => {
    typeData = await fetchData('/api/car/type');
    brandData = await fetchData('/api/car/brand');
    const rsData = await fetchData(`/api/car/car_page?&page=${page}&per_page=${per_page}`)
    carData = rsData.data;
    totalPage = rsData.totalPage;
    await generateCarInfo();
    for (const e of typeData) {
        TypeCheckList.append(`
        <div>
                        <input class="form-check-input typeOption" type="checkbox" value="${e.type}" id="${e.type}">
                        <label class="form-check-label" for="${e.type}">
                           ${e.type}
                        </label>
        </div>
        `)
    }
    for (const e of brandData) {
        BrandCheckList.append(`
        <div>
                        <input class="form-check-input brandOption" type="checkbox" value="${e.brand}" id="${e.brand}">
                        <label class="form-check-label" for="${e.brand}">
                           ${e.brand}
                        </label>
        </div>
        `)
    }
    updatePageInfo();
}

const updatePageInfo = async () => {
    PageInfo.text(`${page}/${totalPage}`)
}

pageInit();