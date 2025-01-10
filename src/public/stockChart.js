let apiUrl = '';
let chartData = [];
let layout = {};

// Helper function to get URL parameters
function getURLParameter(parameterName) {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get(parameterName);
    console.log(`Parameter ${parameterName}: ${param}`); // Debugging log
    return param;
}

// Function to fetch data
async function fetchData(allLogs) {
    try {
        let response = null;
        if (allLogs) {
            response = await fetch(apiUrl + "&logType=all");
        } else {
            response = await fetch(apiUrl);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Debugging log
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Function to update the chart
/*async function updateChart() {
    const newData = await fetchData(false);
    if (newData && newData.data && newData.data.logs.length > 0) {
        const len = newData.data.logs.length;
        const tim = new Date(newData.data.logs[len - 1].createdAt);
        const price = newData.data.logs[len - 1].price;

        // Extend the existing chart traces with new data
        Plotly.extendTraces('stockPriceChart', {
            x: [[tim]],
            y: [[price]],
        }, [0]);

        document.getElementById('companyName').innerText = newData.data.companyName;
        document.getElementById('price').innerText = `₹${newData.data.sellingPrice.toFixed(2)}`;
    } else {
        console.error('No new data available to update the chart.');
    }
}
*/

async function updateChart() {
    const newData = await fetchData(false);
    if (newData && newData.data && newData.data.logs.length > 0) {
        // Filter logs for January 2024
        const januaryLogs = newData.data.logs.filter(log => {
            const date = new Date(log.createdAt);
            return date.getFullYear() === 2024 && date.getMonth() === 0; // January is month 0
        });

        if (januaryLogs.length > 0) {
            const latestLog = januaryLogs[januaryLogs.length - 1];
            const tim = new Date(latestLog.createdAt);
            const price = latestLog.price;

            // Extend the existing chart traces with new data
            Plotly.extendTraces('stockPriceChart', {
                x: [[tim]],
                y: [[price]],
            }, [0]);

            // Dynamically adjust the x-axis range to focus on recent data
            const startDate = new Date(2024, 0, 1); // January 1, 2024
            const endDate = new Date(2024, 0, 31); // January 31, 2024
            Plotly.relayout('stockPriceChart', {
                'xaxis.range': [startDate, endDate]
            });

            // Update other DOM elements
            document.getElementById('companyName').innerText = newData.data.companyName;
            document.getElementById('price').innerText = `₹${newData.data.sellingPrice.toFixed(2)}`;
        } else {
            console.warn('No transactions found for January 2024.');
        }
    } else {
        console.error('No new data available to update the chart.');
    }
}



// Function to create the chart
async function createChart() {
    const stockId = getURLParameter('id');
    if (!stockId) {
        console.error('Stock ID is undefined. Check the URL.');
        return;
    }

    apiUrl = `http://165.232.183.231/api/v1/stocks/get?id=${stockId}`;
    const data = await fetchData(true);

    if (data && data.data) {
        document.getElementById('companyName').innerText = data.data.companyName;
        document.getElementById('price').innerText = `₹${data.data.sellingPrice.toFixed(2)}`;

        chartData = [{
            x: data.data.logs.map(log => new Date(log.createdAt)),
            y: data.data.logs.map(log => log.price),
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
        }];

        layout = {
            title: 'Stock Price vs Time',
            xaxis: {
                title: 'Time',
                type: 'date',
            },
            yaxis: {
                title: 'Stock Price',
            },
        };

        Plotly.newPlot('stockPriceChart', chartData, layout);
    } else {
        console.error('Failed to fetch stock data or data is invalid.');
    }
}

// Update the chart at intervals
setInterval(updateChart, 5000);

// Initial chart creation
createChart();
