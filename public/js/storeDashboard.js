let noCar = 0;
let noAp = 0;;
let noMostCar = 0;
let noMostAp = 0;

let carQuantity = [];
let carName = [];
let apQuantity = [];
let apName = [];

async function getData() {
    try {
        let url = '/api/store/items';
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        data.car.forEach(e => {
            carName.push(e.car_name);
            carQuantity.push(e.quantity)
            noCar += e.quantity;
        });
        data.ap.forEach(e => {
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

async function display() {
    await getData();
    displayCarChart();
    displayApChart();
}

display();