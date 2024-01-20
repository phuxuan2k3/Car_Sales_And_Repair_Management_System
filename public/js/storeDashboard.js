let noCar = 0;
let noAp = 0;;
let noMostCar = 0;
let noMostAp = 0;

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
        const MostCar = await response.json();
        noMostCar = MostCar.quantity;
        $('#noMostCar').text(noMostCar);
        $('#nameMostCar').text(MostCar.car_name);
        $('#priceMostCar').text(MostCar.brand);

        url = '/api/ap/most_ap';
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const MostAp = await response.json();
        noMostAp = MostAp.quantity;
        $('#noMostAp').text(noMostAp);
        $('#nameMostAp').text(MostAp.name);
        $('#priceMostAp').text(MostAp.supplier);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function displayCarChart() {
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
    allItems.car.forEach(e => {
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
                    <li class="mr-md-4">
                        <i class="zmdi zmdi-car-wash"></i>${e.brand}
                    </li>
                    <li class="mr-md-4 ms-2">
                        <i class="zmdi zmdi-money mr-2"></i>${e.price}
                    </li>
                    <li class="mr-md-4 ms-2">
                        <i class="zmdi zmdi-drink"></i> ${e.type}
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-1">
            <div class="job-right my-4 flex-shrink-0">
                <a href="#" class="btn d-block w-100 d-sm-inline-block btn-light"><i
                    class="fa-solid fa-pen-to-square" style="color: #0b488e;"></i></a>
            </div>
            <div class="job-right my-4 flex-shrink-0">
                <a href="#" class="btn d-block w-100 d-sm-inline-block btn-light"><i
                    class="fa-solid fa-trash" style="color: #7e1811;"></i></a>
            </div>
        </div>

    </div>
`)
    })
        ;
}

function displayAp() {
    allItems.ap.forEach(e => {
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
                    <li class="mr-md-4">
                        <i class="zmdi zmdi-car-wash"></i>${e.supplier}
                    </li>
                    <li class="mr-md-4 ms-2">
                        <i class="zmdi zmdi-money mr-2"></i>${e.price}
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-1">
            <div class="job-right my-4 flex-shrink-0">
                <a href="#" class="btn d-block w-100 d-sm-inline-block btn-light"><i
                    class="fa-solid fa-pen-to-square" style="color: #0b488e;"></i></a>
            </div>
            <div class="job-right my-4 flex-shrink-0">
                <a href="#" class="btn d-block w-100 d-sm-inline-block btn-light"><i
                    class="fa-solid fa-trash" style="color: #7e1811;"></i></a>
            </div>
        </div>

    </div>
`)
    })
        ;
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