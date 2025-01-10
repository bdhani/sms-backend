let stockOptions = [];
let stockPrice = 0;

let stockId = '';
let isAll = false;

async function populateStockOptions() {

    if(isAll) {
        try {
            const stockDetails = `http://165.232.183.231/api/v1/stocks/getAllStocks`;
            const response = await fetch(stockDetails);
            const data = await response.json();
            stockOptions = []
            stockOptions = data.data;
            // console.log(stockOptions)
            } catch (error) {
            console.error(`Error fetching stock details`, error);
            
        }
    } else {
        try {
            const stockDetails = `http://165.232.183.231/api/v1/stocks/get?id=${stockId}`;
            const response = await fetch(stockDetails);
            const data = await response.json();
            stockOptions = []
            stockOptions.push(data.data);
            // console.log(stockOptions)
            } catch (error) {
            console.error(`Error fetching stock details`, error);
            
        }

    }
    
    const stockSelection = document.getElementById('stockSelection');
    let child = stockSelection.lastElementChild
    while(child) {
        stockSelection.removeChild(child)
        child = stockSelection.lastElementChild
    }

    
    stockOptions.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock._id;
        option.textContent = `${stock.companyName}`;
        stockSelection.appendChild(option);
    });

}


async function fetchTeamDetails(teamId) {
    try {
        
        const teamDetailsEndpoint = `http://165.232.183.231/api/v1/teams/get?id=${teamId}`;
        const response = await fetch(teamDetailsEndpoint);
        if(response.status === 200) {
            const data = await response.json();
            return data.data;
        } else {
            document.getElementById('teamName').textContent = "N/A";
            document.getElementById('availableBalance').textContent = 0.00;
            alert(`Team not found with id: ${teamId}`)
        }
    } catch (error) {
        console.error(`Error fetching team details for Team ID ${teamId}:`, error);
        return {};
    }
}

// Function to update team details and available balance
async function updateTeamDetailsAndBalance() {

    if(isAll) {
        const stockSelection = document.getElementById('stockSelection');
        stockSelection.value = ''
    }
    
    
    const teamId = document.getElementById('teamId').value;
    // console.log(typeof teamId)
    // Fetch team details
    const teamDetails = await fetchTeamDetails(teamId);
    // console.log(teamDetails.teamId)

    // Update team details in the UI
    // document.getElementById('teamId').textContent = teamDetails.teamId || 'N/A';
    document.getElementById('teamName').textContent = teamDetails.teamName || 'N/A';
    document.getElementById('availableBalance').textContent = teamDetails.currentBalance.toFixed(2) || '0.00';
}

// Function to calculate the total trade amount
// function calculateTotalTradeAmount() {
//     const stockId = document.getElementById('stockSelection').value;
//      fetchLatestStockPrices(stockId).then(price => stockPrice = price)
//     console.log(stockPrice);
//     const quantity = parseInt(document.getElementById('quantity').value, 10) || 0;
//     const totalTradeAmount = (quantity * stockPrice).toFixed(2);
//     document.getElementById('totalTradeAmount').textContent = totalTradeAmount;
// }

// Event listener for the Calculate Amount button
//document.getElementById('calculateAmountButton').addEventListener('click', calculateTotalTradeAmount);


// async function fetchLatestStockPrices(id) {
//     try {
//         const pricesApiUrl = `https://stock-market-simulator-qn698.ondigitalocean.app/api/v1/stocks/get?id=${id}`;
    
//         const response = await fetch(pricesApiUrl);
//         const data = await response.json();

//         // Update global stockPrices variable
//         return data.data.sellingPrice;

//         //console.log('Latest stock prices:', stockPrices);
//     } catch (error) {
//         console.error('Error fetching stock prices:', error);
//     }
// }



// Global variable to store the broker ID after login
let brokerId = null;

// Function to handle broker login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const loginApiUrl = 'http://165.232.183.231/api/v1/brokers/auth';

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

        if (response.status === 200) {
            const responseData = await response.json();
            // console.log(responseData)
            // Login successful, store broker ID
            brokerId = responseData.data.brokerId;
            isAll = responseData.data.isAll;
            stockId = responseData.data.stockId;

            // Hide the login section and show the broker interface section
            document.getElementById('brokerLoginForm').classList.add('hidden');
            document.getElementById('brokerForm').classList.remove('hidden');

            // Fetch latest stock prices (assuming this function is defined in your app)
            // fetchLatestStockPrices();
            populateStockOptions();

        } else if(response.status === 403) {
            // Handle login failure
            alert(`Login failed. Authentication failed`);
        } else {
            alert('Login failed. An unexpected error occurred.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. An unexpected error occurred.');
    }
}

// Function to handle placing an order
async function placeOrder() {
    const teamId = document.getElementById('teamId').value;
    const stockSelection = document.getElementById('stockSelection');
    const orderType = document.getElementById('orderType').value;

    const quantity = document.getElementById('quantity').value;

    // Perform error handling (add your own validation logic)
    if (!teamId || !quantity || isNaN(quantity) || quantity <= 0 || !stockSelection.value) {
        alert('Please enter valid values for Team ID, Quantity and Stocks');
        return;
    }

    const stockid = stockSelection.value;
    // let stockDetails = stockOptions.find((stocks) => {return stocks._id === stockid})
    // document.getElementById('price').value = ((stockDetails.valuation/stockDetails.availableStocks) * quantity).toFixed(2)
    // console.log(stockSelection)
   // const price = calculatePrice(quantity, stockSymbol);

    try {
    
        const orderApiUrl = 'http://165.232.183.231/api/v1/transactions/add';

        const response = await fetch(orderApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                brokerId: brokerId,
                teamId: teamId,
                stockId: stockid,
                numberOfStocks: parseInt(quantity),
                type: orderType,
            }),
        });
        

        if (response.status === 200) {
            // Order placed successfully
            alert(`Order placed!\nTeam ID: ${teamId}\nStock: ${stockid}\nQuantity: ${quantity}\n`);
            if(brokerId!="65bc0a554783f4a26d954330")
            {
                clearForm();

            }
          
        } else {
            // Handle specific error cases
            if (response.status === 410) {
                alert(`Failed to place order. Error: Insufficient team balance`);
            } else if (response.status === 411) {
                alert('Failed to place order. Insufficient quantity of stocks available to teams to sell ');
            } 
            else if (response.status === 409) {
                alert('Failed to place order. Insufficient quantity of stocks available in market to buy');
            }
            else if (response.status === 420) {
                alert(`Wait for 3 mins. Error: ${response.error}`);
            }
            else {
                // Handle other generic errors
                alert(`Failed to place order. Error: ${response.error}`);
            }
        }
    } catch (error) {
        console.error('Error placing order:', error.message);
        alert('Failed to place order. An unexpected error occurred.');
    }
}


// Function to clear the form
function clearForm() {
    document.getElementById('teamId').value = '';
    if(isAll) {
        document.getElementById('stockSelection').innerHTML = '';
    }
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
    document.getElementById('teamName').textContent = "N/A";
    document.getElementById('availableBalance').textContent = 0.00;
    // document.getElementById('availableStocks').value ='';
    populateStockOptions()
}

// function updateAvailableStock() {
//     populateStockOptions()
//     const stockid = document.getElementById('stockSelection').value;
//     let stockDetails = stockOptions.find((stocks) => {return stocks._id === stockid});
//     document.getElementById('availableStocks').value = stockDetails.availableStocks;
// }

function updateOrderValue() {
    // populateStockOptions()
    const stockid = stockSelection.value;
    const quantity = document.getElementById('quantity').value;
    let stockDetails = stockOptions.find((stocks) => {return stocks._id === stockid})
    document.getElementById('price').value = ((stockDetails.valuation/stockDetails.availableStocks) * quantity).toFixed(2)
}

document.getElementById('loginBtn').addEventListener('click', login);
// Event listener for the Place Order button
document.getElementById('placeOrder').addEventListener('click', placeOrder);

// document.getElementById('stockSelection').addEventListener('change', updateAvailableStock);
document.getElementById('quantity').addEventListener('input', updateOrderValue)
// Event listener for the Clear Form button
//document.getElementById('calculate').addEventListener('click', calculateTotalTradeAmount);

document.getElementById("getDetails").addEventListener('click', updateTeamDetailsAndBalance );
// setInterval(fetchLatestStockPrices, 300000);
// fetchLatestStockPrices();

//  setInterval(fetchLatestStockPrices, 300000);
//  fetchLatestStockPrices();

// Populate stock options on page load
