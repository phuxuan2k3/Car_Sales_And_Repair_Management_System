
$('#dashboard').on('click', () => {
    window.location.href = '/dashboard';
})
$('#report').on('click', () => {
    window.location.href = '/report';
})
$('#sale-invoices').on('click', () => {
    window.location.href = '/saleInvoices';
})
$('#fix-invoices').on('click', () => {
    window.location.href = '/fixInvoices';
})

displayChart();
$(".single_quick_activity").addClass("show");

async function displayChart() {
    var selectedOption = $('#dropdownBtn').data('value');
    let response = await fetch(`/api/revenue?type=day&limit=${$('#limit').val()}`);
    if (response.ok) {
        const data1 = await response.json();


        let xValues = data1.start_date;
        let yValues = data1.total_price;

        let barColors = Array(data1.start_date.length).fill('red');

        c1 = new Chart("chart1", {
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
                    text: ""
                }
            }
        });

        response = await fetch('/api/topcar');
        if (response.ok) {
            const data2 = await response.json();

            xValues = data2.name;
            yValues = data2.total_quantity;
            barColors = [];
            for (let i = 0; i < 10; i++) {
                const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                barColors.push(color);
            }
            barColors;

            c2 = new Chart("chart2", {
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

        response = await fetch('/api/countCus');
        if (response.ok) {
            $('#noCus').text(await response.json());
        }
        response = await fetch('/api/car/count');
        if (response.ok) {
            $('#noCar').text(await response.json());
        }
        response = await fetch('/api/saleTotal');
        if (response.ok) {
            $('#saleTotal').text(Math.round(await response.json()));
        }
        response = await fetch('/api/fixTotal');
        if (response.ok) {
            $('#fixTotal').text(Math.round(await response.json()));
        }
    }
}
let c1, c2;

$(".dropdown-item").on('click', async function () {
    var selectedOption = $(this).text();
    console.log($("#dropdownBtn").text(), $("#limit").val());
    $('#dropdownBtn').text(selectedOption);
    $('#dropdownBtn').data('n', selectedOption);

    let response = await fetch(`/api/revenue?type=${selectedOption}&limit=${$('#limit').val()}`);
    if (response.ok) {
        const data1 = await response.json();


        let xValues = data1.start_date;
        let yValues = data1.total_price;

        let barColors = Array(data1.start_date.length).fill('red');

        c1.destroy();
        c1 = c1 = new Chart("chart1", {
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
                    text: ""
                }
            }
        });
    }
})

$("#limit").on("input", function () {
    var currentValue = $(this).val();
    var regex = /^(?:[1-9]|10)$/;
    if (!regex.test(currentValue)) {
        $(this).val(1);
    }
});

$('#limit').on('input', async function () {
    var selectedOption = $('#dropdownBtn').data('n');
    console.log($("#dropdownBtn").text(), $("#limit").val());
    let response = await fetch(`/api/revenue?type=${selectedOption}&limit=${$('#limit').val()}`);
    if (response.ok) {
        const data1 = await response.json();


        let xValues = data1.start_date;
        let yValues = data1.total_price;

        let barColors = Array(data1.start_date.length).fill('red');

        c1.destroy();
        c1 = c1 = new Chart("chart1", {
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
                    text: ""
                }
            }
        });
    }
})

