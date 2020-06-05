
let UIController = (() => {
    let HTMLStrings = {
        selectDayRange: '.select-day-range',
        confirmedCount: '#confirmed-count',
        activeCount: '#active-count',
        recoveredCount: '#recovered-count',
        deathCount: '#death-count',
        rangeConfirmedCount: '#range-confirmed-count',
        confirmedChart: '#confirmed-case-chart',
        confirmSelectDayRange: '#confirm-select-day-range',
        activeCard: '#active-card',
        rangeActiveCount: '#range-active-count',
        activeChart: '#active-case-chart',
        activeSelectDayRange: '#active-select-day-range',
        recoveredCard: '#recovered-card',
        rangeRecoveredCount: '#range-recovered-count',
        recoveredChart: '#recovered-case-chart',
        recoveredSelectDayRange: '#recovered-select-day-range',
        deathCard: '#death-card',
        rangeDeathCount: '#range-death-count',
        deathChart: '#death-case-chart',
        deathSelectDayRange: '#death-select-day-range'
    };

    let setTotalCasesForStatus = (data) => {
        document.querySelector(HTMLStrings.confirmedCount).innerText = UIController.numberFormat(data[0]['Confirmed']);
        document.querySelector(HTMLStrings.activeCount).innerText = UIController.numberFormat(data[0]['Active']);
        document.querySelector(HTMLStrings.recoveredCount).innerText = UIController.numberFormat(data[0]['Recovered']);
        document.querySelector(HTMLStrings.deathCount).innerText = UIController.numberFormat(data[0]['Deaths']);
    }

    let setCasesForStatus = (count, status) => {
        if (status === 'active')
            document.querySelector(HTMLStrings.rangeActiveCount).innerText = UIController.numberFormat(count);

        if (status === 'confirmed')
            document.querySelector(HTMLStrings.rangeConfirmedCount).innerText = UIController.numberFormat(count);

        if (status === 'recovered')
            document.querySelector(HTMLStrings.rangeRecoveredCount).innerText = UIController.numberFormat(count);

        if (status === 'deaths')
            document.querySelector(HTMLStrings.rangeDeathCount).innerText = UIController.numberFormat(count);
    }

    let setChartForStatus = (data, status = 'confirmed') => {

        let labels = [];
        let chartData = [];
        let months = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];

        for (let i = 0; i < data.length; i = i + 5) {
            let d = new Date(data[i]['Date']);
            labels.push(d.getDate() + " " + months[d.getMonth()]);
            chartData.push(data[i]['Cases']);
        }
        labels.push(new Date().getDate() + " " + months[new Date().getMonth()]);
        chartData.push(data[data.length - 1]['Cases']);

        let chartName = HTMLStrings.confirmedChart;
        if (status === 'active')
            chartName = HTMLStrings.activeChart;
        if (status === 'recovered')
            chartName = HTMLStrings.recoveredChart;
        if (status === 'deaths')
            chartName = HTMLStrings.deathChart;

        let ctx = document.querySelector(chartName);
        let statusChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'COVID-19 Cases',
                    data: chartData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false,
                            stepSize: 10000,
                        }
                    }]
                }
            }
        });
    }

    return {
        numberFormat(number) {
            return Intl.NumberFormat('en-IN').format(number);
        },

        getHTMLStrings() {
            return HTMLStrings;
        },

        getSummaryCount() {
            let yesterday = moment().subtract(1, 'days').format().split('T')[0];
            let today = moment().format().split('T')[0];
            console.log(yesterday);
            axios.get('https://api.covid19api.com/country/india?from=' + yesterday + 'T00:00:00Z&to=' + today + 'T00:00:00Z')
                .then( response => {
                let res = response['data'];
                setTotalCasesForStatus(res);
            });
        },

        getCasesForStatus(status = 'confirmed', delta = 30) {

            let fromDate = moment().subtract(delta, 'days').format().split('T')[0];
            let toDate = moment().format().split('T')[0];

            axios.get('https://api.covid19api.com/total/country/india/status/' + status
                + '?from=' + fromDate + 'T00:00:00Z&to=' + toDate + 'T00:00:00Z').then( response => {
                let res = response['data'];
                setCasesForStatus(res[res.length - 1]['Cases'] - res[0]['Cases'], status);
                setChartForStatus(res, status);
            });
        }
    }
})();

((UIController) => {

    let HTMLStrings = UIController.getHTMLStrings();
    let setupEventListeners = () => {
        document.querySelector(HTMLStrings.confirmSelectDayRange).addEventListener('change', (event) => {
            UIController.getCasesForStatus('confirmed', event.target.value);
        });

        document.querySelector(HTMLStrings.recoveredSelectDayRange).addEventListener('change', (event) => {
            UIController.getCasesForStatus('recovered', event.target.value);
        });

        document.querySelector(HTMLStrings.activeSelectDayRange).addEventListener('change', (event) => {
            UIController.getCasesForStatus('active', event.target.value);
        });

        document.querySelector(HTMLStrings.deathCard).addEventListener('click', () => {
            UIController.getCasesForStatus('deaths');
        });

        document.querySelector(HTMLStrings.recoveredCard).addEventListener('click', () => {
            UIController.getCasesForStatus('recovered');
        });
    };

    let init = () => {
        console.log('Initializing...');
        setupEventListeners();
        UIController.getSummaryCount();
        UIController.getCasesForStatus('confirmed');
    }
    init();

})(UIController);
