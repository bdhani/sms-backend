// Global variables to store team details and transaction history
let teamDetails = {};
let teamId = null;
let portfolio = [];
let worthDetails = {};
// let portWorth = 0;
// let totWorth = 0;

// Function to handle login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const loginApiUrl = 'http://165.232.183.231/api/v1/teams/auth';

        const response = await fetch(loginApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        // console.log(responseData)

        if (response.status === 200) {
       
            const responseData = await response.json();

            // Login successful, store team ID
            teamId = responseData.data;

            // Hide the login section and show the broker interface section
            document.getElementById('teamLoginForm').classList.add('hidden');
            document.getElementById('teamInterface').classList.remove('hidden');
            updateTeamDetails();
            // fetchLatestStockPrices();
        } else if(response.status === 403) {
            alert("Login failed. Authentication failed")
        } else {
            // Handle login failure
            alert(`Login failed. An unexpected error occured`);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. An unexpected error occurred.');
    }
}

function holdings()
{
    portfolio = [];
    teamDetails.portfolio.forEach(element => {
        let stockDet = teamDetails.stockDetails.find((ele)=> {return ele._id===element.stocks})
        if(stockDet.isLaunched) {
            portfolio.push({
                "_id" : element.stocks,
                "numberOfStocks" : element.numberOfStocks,
                "sellingPrice" : (stockDet.valuation/stockDet.availableStocks).toFixed(2),
                "companyName" : stockDet.companyName
            })
        }
        
            // console.log(holdings.numberOfStocks)
    });

//     // console.log(portfolio)
//     // console.log(portWorth)

}

// Function to update team details and transaction history
async function updateTeamDetails() {
    teamDetails = await fetchTeamDetails(teamId);
    worthDetails = await fetchPortfolioWorthDetails(teamId);
    
    document.getElementById('teamId').textContent = teamDetails.teamId || 'N/A';
    document.getElementById('teamName').textContent = teamDetails.teamName || 'N/A';
    document.getElementById('currentCashBalance').textContent = `${teamDetails.currentBalance.toFixed(2)}`;
    
    holdings();
    document.getElementById('portfolioWorth').textContent = `${worthDetails.portfolioWorth.toFixed(2)}`;
    document.getElementById('totWorth').textContent = `${worthDetails.totalWorth.toFixed(2)}`;
    
    const holdingsSection = document.getElementById('holdingsSection');
    holdingsSection.innerHTML = '';

    portfolio.forEach(holding => {
        const holdingCard = document.createElement('div');
        holdingCard.className = 'bg-white p-4 rounded-md shadow-md';

        const stockNameElement = document.createElement('h3');
        stockNameElement.className = 'text-xl font-bold mb-2';
        stockNameElement.textContent = holding.companyName;
        holdingCard.appendChild(stockNameElement);

        const holdingDetailsElementQuantity = document.createElement('p');
        holdingDetailsElementQuantity.className = 'text-gray-600 p-4';
        holdingDetailsElementQuantity.textContent = `Quantity: ${holding.numberOfStocks}`;
        holdingCard.appendChild(holdingDetailsElementQuantity);

        const holdingDetailsElementPrice = document.createElement('p');
        holdingDetailsElementPrice.className = 'text-gray-600 p-4';
        holdingDetailsElementPrice.textContent = `Current Stock Price: ₹${holding.sellingPrice}`;
        holdingCard.appendChild(holdingDetailsElementPrice);

        const tradeCurrentValue = document.createElement('p');
        tradeCurrentValue.className = 'text-gray-600 p-4';
        tradeCurrentValue.textContent = `Trade Value: ₹${Math.round(holding.sellingPrice*holding.numberOfStocks)}`;
        holdingCard.appendChild(tradeCurrentValue);

        holdingsSection.appendChild(holdingCard);
    });

}
async function fetchTeamDetails(teamId) {
    try {
        
        const teamDetailsEndpoint = `http://165.232.183.231/api/v1/teams/getPortfolioDetails?id=${teamId}`;
        const response = await fetch(teamDetailsEndpoint);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching team details for Team ID ${teamId}:`, error);
        return {};
    }
}

async function fetchPortfolioWorthDetails(teamId) {
    try {
        
        const worthDetailsEndpoint = `http://165.232.183.231/api/v1/teams/getWorth?id=${teamId}`;
        const response = await fetch(worthDetailsEndpoint);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching worth details for Team ID ${teamId}:`, error);
        return {};
    }
}


//updateTeamDetails();
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('refresh').addEventListener('click', updateTeamDetails);
// setInterval(() => {
    
//     updateTeamDetails();
// }, 300000);


// function populateTransactionHistory() {
//     const transactionSection = document.getElementById('transactionSection');
    
//     // Clear existing transaction cards
//     transactionSection.innerHTML = '';

//     transactions.forEach(transaction => {
//         const transactionCard = document.createElement('div');
//         transactionCard.className = 'bg-white p-4 rounded-md shadow-md';

//         const timeElement = document.createElement('p');
//         timeElement.className = 'text-gray-500 mb-2';
//         timeElement.textContent = transaction.time;
//         transactionCard.appendChild(timeElement);

//         const stockNameElement = document.createElement('h3');
//         stockNameElement.className = 'text-xl font-bold mb-2';
//         stockNameElement.textContent = transaction.stockName;
//         transactionCard.appendChild(stockNameElement);

//         const transactionDetailsElement = document.createElement('p');
//         transactionDetailsElement.className = 'text-gray-600';
//         transactionDetailsElement.textContent = `Quantity: ${transaction.quantity} x Price: $${transaction.price} Value: $${transaction.value}`;
//         transactionCard.appendChild(transactionDetailsElement);

//         // Color coding for buy (green) and sell (red) transactions
//         if (transaction.type === 'buy') {
//             transactionCard.classList.add('bg-green-100');
//         } else if (transaction.type === 'sell') {
//             transactionCard.classList.add('bg-red-100');
//         }

//         transactionSection.appendChild(transactionCard);
//     });
// }