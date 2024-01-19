let noCar;
let noAp;
let noMostCar = 20;
let noMostAp = 30;

async function getData() {
    try {
        //get noCar
        let url = '/api/car/no_remain_car';
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        noCar = (await response.json()).sum;

        //get MostCar
        url = '/api/car/most_car';
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const mostCar = (await response.json());
        noMostCar = mostCar.quantity;
        $('#noMostCar').text(noMostCar);
        $('#nameMostCar').text(mostCar.car_name);
        $('#priceMostCar').text(mostCar.brand);


        //get noAp
        url = '/api/ap/no_remain_ap';
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        noAp = (await response.json()).sum;

        //get MostCar
        url = '/api/ap/most_ap';
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const mostAp = (await response.json());
        noMostAp = mostAp.quantity;
        $('#noMostAp').text(noMostAp);
        $('#nameMostAp').text(mostAp.name);
        $('#priceMostAp').text(mostAp.supplier);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function displayChart() {
    const xValues = ["Car", "Auto Part"];
    const yValues = [noCar, noAp];
    const barColors = [
        "red",
        "green"
    ];

    new Chart("myChart", {
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
                text: "Number of Cars and Auto Parts remaining in store"
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
    displayChart();
}

display();