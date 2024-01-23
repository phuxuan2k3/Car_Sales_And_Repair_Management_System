
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
    let response = await fetch('/api/revenue');
    if (response.ok) {
        const data1 = await response.json();


        let xValues = data1.start_date;
        let yValues = data1.total_price;

        let barColors = Array(data1.start_date.length).fill('red');

        new Chart("chart1", {
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

            new Chart("chart2", {
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
    }
}
