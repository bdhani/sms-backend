// Function to fetch all stocks from the API
async function fetchAllStocks() {
    try {
        const stocksEndpoint = 'http://165.232.183.231/api/v1/stocks/getAllStocks';
        const response = await fetch(stocksEndpoint);
        const data = await response.json();
        console.log('Fetched stocks:', data); // Debugging log
        return data.data;
    } catch (error) {
        console.error('Error fetching stocks:', error);
        return [];
    }
}

// Function to generate the chart URL for a given stock
function generateChartURL(stockId) {
    return `chart.html?id=${stockId}`;
}

// Function to update the stock cards on the landing page
async function updateStockCards() {
    const allStocks = await fetchAllStocks();
    const launchedStocks = allStocks.filter(stock => stock.isLaunched);

    const stockCardsContainer = document.querySelector('.grid');

    stockCardsContainer.innerHTML = ''; // Clear existing cards
    launchedStocks.forEach(stock => {
        const stockCard = document.createElement('div');
        stockCard.className = 'bg-white p-4 rounded-md shadow-md';

        const stockNameElement = document.createElement('h3');
        stockNameElement.className = 'text-xl font-bold mb-2';
        stockNameElement.textContent = stock.companyName;
        stockCard.appendChild(stockNameElement);

        const currentPriceElement = document.createElement('p');
        currentPriceElement.className = 'text-gray-600';
        currentPriceElement.textContent = `Current Price: ₹${stock.sellingPrice.toFixed(2)}`;
        stockCard.appendChild(currentPriceElement);

        const chartLinkElement = document.createElement('a');
        chartLinkElement.href = generateChartURL(stock._id); 
        chartLinkElement.className = 'text-blue-500 underline';
        chartLinkElement.textContent = 'View Chart';
        stockCard.appendChild(chartLinkElement);

        stockCardsContainer.appendChild(stockCard);
    });
}

// Initial call to update the stock cards
updateStockCards();

// Event listener to refresh stock cards on button click
document.getElementById('refresh').addEventListener('click', updateStockCards);

// Optional: Uncomment to auto-refresh stock cards every 3 seconds
// setInterval(updateStockCards, 3000);
