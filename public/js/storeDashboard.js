let noCar = 0;
let noAp = 0;;
let noMostCar = 0;
let noMostAp = 0;
let MostCar;
let MostAp;

let carQuantity = [];
let carName = [];
let apQuantity = [];
let apName = [];

let allItems;

async function getData() {
    try {
        let url = '/api/store/items';
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        allItems = await response.json();
        allItems.car.forEach(e => {
            carName.push(e.car_name);
            carQuantity.push(e.quantity)
            noCar += e.quantity;
        });
        allItems.ap.forEach(e => {
            apName.push(e.name);
            apQuantity.push(e.quantity)
            noAp += e.quantity;
        });

        url = '/api/car/most_car';
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        MostCar = await response.json();
        noMostCar = MostCar.quantity;


        url = '/api/ap/most_ap';
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        MostAp = await response.json();
        noMostAp = MostAp.quantity;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function displayCarChart() {
    $('#noMostCar').text(noMostCar);
    $('#nameMostCar').text(MostCar.car_name);
    $('#priceMostCar').text(MostCar.brand);

    let xValues = carName;
    let yValues = carQuantity;
    let barColors = Array(carName.length).fill('red');

    new Chart("carChart", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            legend: { display: false },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
            },
            title: {
                display: true,
                text: "Number of Cars remaining"
            }
        }
    });


    xValues = ["Most AutoPart", "Others"];
    yValues = [noMostAp, noAp - noMostAp];
    barColors = [
        "#2b5797",
        "#e8c3b9"
    ];

    new Chart("mostAp", {
        type: "doughnut",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            title: {
                display: true
            }
        }
    });

    xValues = ["Most Car", "Others"];
    yValues = [noMostCar, noCar - noMostCar];
    barColors = [
        "#b91d47",
        "#00aba9",
    ];

    new Chart("mostCar", {
        type: "doughnut",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            title: {
                display: true
            }
        }
    });
}

function displayApChart() {
    $('#noMostAp').text(noMostAp);
    $('#nameMostAp').text(MostAp.name);
    $('#priceMostAp').text(MostAp.supplier);

    const xValues = apName;
    const yValues = apQuantity;
    const barColors = Array(apName.length).fill('blue');

    new Chart("apChart", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            legend: { display: false },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
            },
            title: {
                display: true,
                text: "Number of Auto Parts remaining"
            }
        }
    });


    $('.pieMostCar').css({
        'width': '100px',
        'height': '100px',
        'background-image': `conic-gradient(red 0% ${noMostCar / noCar * 100}%, black ${noMostCar / noCar * 100}% 100%)`,
        'border-radius': '50%'
    });

    $('.pieMostAp').css({
        'width': '100px',
        'height': '100px',
        'background-image': `conic-gradient(green 0% ${noMostAp / noAp * 100}%, black ${noMostAp / noAp * 100}% 100%)`,
        'border-radius': '50%'
    });
}

async function displayDashboard() {
    $('#mainContent').html(` <div class="row justify-content-center">
        <canvas id = "carChart" style = "width:100%;height:300px"> </>
                </div >
                <div class="row justify-content-center">
                    <canvas id="apChart" style="width:100%;height:300px"></canvas>
                </div>

                <div class="row justify-content-evenly">
                    <div class="card m-3 col-5">
                        <div class="card-body">
                            <div class="row align-items-center flex-row">
                                <div style="font-size: 12px; color:red"><i>*the most remaining car</i></div>
                                <div class="col-5">
                                    <h2 class="mb-0 d-flex align-items-center"><span id="noMostCar">86.4</span><span
                                            class="dot bg-green d-inline-block ml-3"></span></h2><span
                                        class="text-muted text-uppercase small" id="nameMostCar">Work hours</span>
                                    <hr><small class="text-muted" id="priceMostCar"></small>
                                </div>
                                <div class="col-7">
                                    <canvas id="mostCar" style="height:50px;width:50px"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card m-3 col-5">
                        <div class="card-body">
                            <div class="row align-items-center flex-row">
                                <div style="font-size: 12px; color:red"><i>*the most remaining auto part</i></div>
                                <div class="col-5">
                                    <h2 class="mb-0 d-flex align-items-center"><span id="noMostAp">86.4</span><span
                                            class="dot bg-green d-inline-block ml-3"></span></h2><span
                                        class="text-muted text-uppercase small" id="nameMostAp">Work hours</span>
                                    <hr><small class="text-muted" id="priceMostAp">Lorem ipsum dolor sit</small>
                                </div>
                                <div class="col-7">
                                    <canvas id="mostAp" style="height:50px;width:50px"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
`);
    displayCarChart();
    displayApChart();
}

async function initWindow() {
    await getData();
    displayMode('dashboard');
}

initWindow();

//getMode
//displaymode

function removeContent() {
    $('#mainContent').empty();
}

function displayMode(mode) {
    removeContent();
    switch (mode) {
        case 'car':
            displayCar();
            break;
        case 'ap':
            displayAp();
            break;
        default:
            displayDashboard();
            break;
    }
}

function displayCar() {
    allItems.car.forEach((e, index) => {
        $('#mainContent').append(`
    <div class="job-box d-md-flex align-items-center justify-content-between mb-30">
        <div class="job-left my-4 d-md-flex align-items-center flex-wrap">
            <div
                class="img-holder mr-md-4 mb-md-0 mb-4 mx-auto mx-md-0 d-md-none d-lg-flex">
                ${e.quantity}
            </div>
            <div class="job-content">
                <h5 class="text-center text-md-left">${e.car_name}</h5>
                <ul class="d-md-flex flex-wrap text-capitalize ff-open-sans">
                    <li class="mr-md-4 ms-5">
                        <i class="zmdi zmdi-car-wash"></i>${e.brand}
                    </li>
                    <li class="mr-md-4 ms-5">
                        <i class="zmdi zmdi-money mr-2"></i>${e.price}
                    </li>
                    <li class="mr-md-4 ms-5">
                        <i class="zmdi zmdi-drink"></i> ${e.type}
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-1">
            <div class="job-right my-4 flex-shrink-0 ">
                <a href="#" class="btn d-block w-100 d-sm-inline-block btn-light edit" data-index=${index}><i
                    class="fa-solid fa-pen-to-square" style="color: #0b488e;" data-index=${index}></i></a>
            </div>
            <div class="job-right my-4 flex-shrink-0 ">
                <a href="#" class="btn d-block w-100 d-sm-inline-block btn-light delete" data-index=${index}><i
                    class="fa-solid fa-trash" style="color: #7e1811;" data-index=${index}></i></a>
            </div>
        </div>

    </div>
`)
    });
    assignCarEdit();
}

function displayAp() {
    allItems.ap.forEach((e, index) => {
        $('#mainContent').append(`
    <div class="job-box d-md-flex align-items-center justify-content-between mb-30">
        <div class="job-left my-4 d-md-flex align-items-center flex-wrap">
            <div
                class="img-holder mr-md-4 mb-md-0 mb-4 mx-auto mx-md-0 d-md-none d-lg-flex">
                ${e.quantity}
            </div>
            <div class="job-content">
                <h5 class="text-center text-md-left">${e.name}</h5>
                <ul class="d-md-flex flex-wrap text-capitalize ff-open-sans">
                    <li class="mr-md-4 ms-3">
                        <i class="zmdi zmdi-memory"></i>${e.supplier}
                    </li>
                    <li class="mr-md-4 ms-3">
                        <i class="zmdi zmdi-money mr-2"></i>${e.price}
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-1">
            <div class="job-right my-4 flex-shrink-0 edit" data-index=${index}>
                <a href="#!" class="btn d-block w-100 d-sm-inline-block btn-light"><i
                    class="fa-solid fa-pen-to-square" style="color: #0b488e;" data-index=${index}></i></a>
            </div>
            <div class="job-right my-4 flex-shrink-0 delete" data-index=${index}>
                <a href="#!" class="btn d-block w-100 d-sm-inline-block btn-light"><i
                    class="fa-solid fa-trash" style="color: #7e1811;" data-index=${index}></i></a>
            </div>
        </div>

    </div>
`)
    });
    assignApEdit();
}

$('#dashboard').click(() => {
    displayMode('dashboard');
})
$('#car').click(() => {
    displayMode('car');
})
$('#ap').click(() => {
    displayMode('ap');
})

function assignCloseForm() {
    $('.close').click(() => {
        $('form').remove();
    })
}

function assignCarEdit() {
    $('.edit').click(function (e) {
        const curCarIndex = $(e.target).data('index');
        const curCar = allItems.car[curCarIndex];

        $('#mainContent').append(`<form class="edit-form">
                    <div class="dark-background"></div>
                    <div class="form-container rounded bg-white mt-5 mb-5">
                        <div class="row">
                            <div class="col-md-3 border-right">
                                <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img
                                        class="rounded-circle mt-5" width="150px"
                                        src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"><span
                                        class="font-weight-bold">Avatar</span>

                                    <div class="small font-italic text-muted mb-4">JPG or PNG no larger than 5 MB
                                    </div>
                                    <input name="avatar" class="form-control primary" type="file" id="formFile">
                                </div>
                            </div>
                            <div class="col-md-5 border-right ms-5 ps-4">
                                <div class="p-3 py-5">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h4 class="text-right">Profile Settings</h4>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-md-12"><label class="labels">Name</label><input type="text"
                                                class="form-control" placeholder="name" value="${curCar.car_name}"></div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-12"><label class="labels">Brand</label><input type="text"
                                                class="form-control" placeholder="brand" value="${curCar.brand}"></div>
                                        <div class="col-md-12"><label class="labels">Type</label><input type="text"
                                                class="form-control" placeholder="type" value="${curCar.type}"></div>
                                        <div class="col-md-12"><label class="labels">Year</label><input type="text"
                                                class="form-control" placeholder="year" value="${curCar.year}"></div>
                                        <div class="col-md-12"><label class="labels">Price</label><input type="text"
                                                class="form-control" placeholder="price" value="${curCar.price}"></div>
                                        <div class="col-md-12"><label class="labels">Description</label><input
                                                type="text" class="form-control" placeholder="description" value="${curCar.description}">
                                        </div>
                                        <div class="col-md-12"><label class="labels">Quantity</label><input type="text"
                                                class="form-control" placeholder="quantity" value="${curCar.quantity}"></div>
                                    </div>
                                    <div class="mt-5 text-center"><button class="btn btn-primary profile-button"
                                            type="button">Save
                                            Profile</button></div>
                                </div>
                            </div>

                            <div class="col-3 ms-5">
                                <div class="p-3 py-5">
                                    <div class="d-flex justify-content-between align-items-center experience"><span
                                            class="border px-3 p-1 add-experience close"><i
                                                class="fa-solid fa-xmark"></i>&nbsp;Close</span></div><br>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>`);
        assignCloseForm();
    });
};

function assignApEdit() {
    $('.edit').click(function (e) {
        const curApIndex = $(e.target).data('index');
        const curAp = allItems.ap[curApIndex];

        $('#mainContent').append(`<form class="edit-form">
                    <div class="dark-background"></div>
                    <div class="form-container rounded bg-white mt-5 mb-5">
                        <div class="row">
                            <div class="col-md-3 border-right">
                                <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img
                                        class="rounded-circle mt-5" width="150px"
                                        src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"><span
                                        class="font-weight-bold">Avatar</span>

                                    <div class="small font-italic text-muted mb-4">JPG or PNG no larger than 5 MB
                                    </div>
                                    <input name="avatar" class="form-control primary" type="file" id="formFile">
                                </div>
                            </div>
                            <div class="col-md-5 border-right ms-5 ps-4">
                                <div class="p-3 py-5">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h4 class="text-right">Profile Settings</h4>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-md-12"><label class="labels">Name</label><input type="text"
                                                class="form-control" placeholder="name" value="${curAp.name}"></div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-12"><label class="labels">Supplier</label><input type="text"
                                                class="form-control" placeholder="supplier" value="${curAp.supplier}"></div>
                                        <div class="col-md-12"><label class="labels">Price</label><input type="text"
                                                class="form-control" placeholder="price" value="${curAp.price}"></div>
                                        <div class="col-md-12"><label class="labels">Description</label><input
                                                type="text" class="form-control" placeholder="description" value="${curAp.description}">
                                        </div>
                                        <div class="col-md-12"><label class="labels">Quantity</label><input type="text"
                                                class="form-control" placeholder="quantity" value="${curAp.quantity}"></div>
                                    </div>
                                    <div class="mt-5 text-center"><button class="btn btn-primary profile-button"
                                            type="button">Save
                                            Profile</button></div>
                                </div>
                            </div>

                            <div class="col-3 ms-5">
                                <div class="p-3 py-5">
                                    <div class="d-flex justify-content-between align-items-center experience"><span
                                            class="border px-3 p-1 add-experience close"><i
                                                class="fa-solid fa-xmark"></i>&nbsp;Close</span></div><br>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>`);
        assignCloseForm();
    });
};