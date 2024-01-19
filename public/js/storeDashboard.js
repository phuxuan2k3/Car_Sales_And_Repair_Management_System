let noCar = 55;
let noAp = 60;
let noMostCar = 20;
let noMostAp = 30;

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