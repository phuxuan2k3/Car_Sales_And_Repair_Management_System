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
        let response = await xuanFetchGet(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        allItems = await response.json();
        allItems.car.forEach(e => {
            carName.push(e.car_name);
            carQuantity.push(e.quantity);
            noCar += e.quantity;
        });
        allItems.ap.forEach(e => {
            apName.push(e.name);
            apQuantity.push(e.quantity)
            noAp += e.quantity;
        });

        url = '/api/car/most_car';
        response = await xuanFetchGet(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        try {
            MostCar = await response.json();
            if (MostCar) {
                noMostCar = MostCar.quantity;
            }
        } catch (error) {

        }


        url = '/api/ap/most_ap';
        response = await xuanFetchGet(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        try {
            MostAp = await response.json();
            if (MostAp) {
                noMostAp = MostAp.quantity;
            }
        } catch (error) {

        }

    } catch (error) {
        console.error('Error:', error);
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
    $('#mainContent').html(`
        <div class="row justify-content-center my-2">
            <canvas id="carChart" style="height:300px"></canvas>
        </div>
        <div class="row justify-content-center my-2">
            <canvas id="apChart" style="height:300px"></canvas>
        </div>
        <div class="row gx-2 my-2 row-cols-1 row-cols-md-2 gy-2 my-2">
            <div>
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center flex-row">
                            <div
                                style="font-size: 12px; color:red"><i>*the
                                    most remaining car</i></div>
                            <div class="col-5">
                                <h2
                                    class="mb-0 d-flex align-items-center"><span
                                        id="noMostCar">86.4</span><span
                                        class="dot bg-green d-inline-block ml-3"></span></h2><span
                                    class="text-muted text-uppercase small"
                                    id="nameMostCar">Work hours</span>
                                <hr><small class="text-muted"
                                    id="priceMostCar"></small>
                            </div>
                            <div class="col-7">
                                <canvas id="mostCar"
                                    style="height:50px;width:50px"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center flex-row">
                            <div
                                style="font-size: 12px; color:red"><i>*the
                                    most remaining auto part</i></div>
                            <div class="col-5">
                                <h2
                                    class="mb-0 d-flex align-items-center"><span
                                        id="noMostAp">86.4</span><span
                                        class="dot bg-green d-inline-block ml-3"></span></h2><span
                                    class="text-muted text-uppercase small"
                                    id="nameMostAp">Work hours</span>
                                <hr><small class="text-muted"
                                    id="priceMostAp">Lorem ipsum dolor
                                    sit</small>
                            </div>
                            <div class="col-7">
                                <canvas id="mostAp"
                                    style="height:50px;width:50px"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`);
    try {
        displayCarChart();
    } catch (error) {

    }
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

$('#dashboard').on('click', () => {
    window.location.href = '/dashboard';
})
$('#car').on('click', () => {
    window.location.href = '/car';
})
$('#ap').on('click', () => {
    window.location.href = '/ap';
})
$('#brand').on('click', () => {
    window.location.href = '/brand';
})
$('#type').on('click', () => {
    window.location.href = '/type';
})