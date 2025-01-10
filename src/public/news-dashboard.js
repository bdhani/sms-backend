 async function getStockDetails() {
    try {
        // Fetch details of all stocks
        const allStocks = await fetchAllStocks();
        const newsSectionsContainer = document.getElementById('newsSectionsContainer');

        // Iterate over each stock and create a news section
        for (const stock of allStocks) {
            const stockSection = document.createElement('div');
            stockSection.className = 'mb-8';

            // Stock Details
            const stockDetails = document.createElement('div');
            stockDetails.className = 'mb-4';
            stockDetails.innerHTML = `
                <h2 class="text-xl font-bold">${stock.companyName}</h2>
            `;
            stockSection.appendChild(stockDetails);

            // Fetch news for the current stock
            const stockNews = await fetchStockNews(stock._id);

            // Display news cards for the stock
            displayNewsCards(stockNews, stockSection);

            // Append the stock section to the container
            newsSectionsContainer.appendChild(stockSection);
        }
    } catch (error) {
        console.error('Error fetching stock details:', error);
        alert('An error occurred while fetching stock details. Please try again.');
    }
}

// Function to fetch details of all stocks
async function fetchAllStocks() {
    try {
        const stocksEndpoint = 'http://165.232.183.231/api/v1/stocks/getAllStocks';
        const response = await fetch(stocksEndpoint);
        const data = await response.json();
        return data.data;
    } catch (error) {
        throw new Error('Error fetching stocks:', error);
    }
}


// Function to fetch news for a specific stock
async function fetchStockNews(stockId) {
    try {
        const newsEndpoint = `http://165.232.183.231/api/v1/news/getNewsbyFilter?stocks=${stockId}&sentiment=all`;
        const response = await fetch(newsEndpoint);
        const data = await response.json();
        return data.data;
    } catch (error) {
        throw new Error(`Error fetching news for stock ${stockId}:`, error);
    }
}

// Function to display news cards for a stock
/*
function displayNewsCards(newsData, container) {
    // Iterate over news and create news cards
    for (const newsItem of newsData) {
        const newsCard = document.createElement('div');
        newsCard.className = 'bg-white p-4 rounded-md shadow-md mb-4';

        const newsTime = new Date(newsItem.createdAt).toLocaleString();
        newsCard.innerHTML = `
            <p class="text-sm text-gray-500">${newsTime}</p>
            <p class="text-base"><em>${newsItem.sentiment}</em></p>
            <p class="text-base">${newsItem.newsText}</p>
        `;

        // Display button or indication based on the 'isDisplayed' property
        if (newsItem.isDisplayed) {
            const displayedIndicator = document.createElement('p');
            displayedIndicator.className = 'text-green-500 mt-2';
            displayedIndicator.textContent = 'Displayed';
            newsCard.appendChild(displayedIndicator);
        } else {
            const publishButton = document.createElement('button');
            publishButton.className = 'mt-2 p-2 bg-blue-500 text-white rounded-md';
            publishButton.textContent = 'Publish';
            publishButton.addEventListener('click', async function () {
                try {
                    const publishEndpoint = `http://localhost:8000/api/v1/news/publish?id=${newsItem._id}`;
                    const publishResponse = await fetch(publishEndpoint, { method: 'POST' });
                    console.log(publishResponse);
                    if (publishResponse.status===200) {

                        alert(`News published successfully!`);
                        
                        // getStockDetails();
                        
                    } else {
                        alert(`Failed to publish news. Server responded with status ${publishResponse.statusCode}`);
                    }
                } catch (error) {
                    console.error('Error publishing news:', error);
                    alert('An error occurred while publishing news. Please try again.');
                }
            });

            newsCard.appendChild(publishButton);
        }

        container.appendChild(newsCard);
    }
}
*/
// Function to display news cards for a stock
function displayNewsCards(newsData, container) {
    // Iterate over news and create news cards
    for (const newsItem of newsData) {
        const newsCard = document.createElement('div');
        newsCard.className = 'bg-white p-4 rounded-md shadow-md mb-4';

        const newsTime = new Date(newsItem.createdAt).toLocaleString();
        newsCard.innerHTML = `
            <p class="text-sm text-gray-500">${newsTime}</p>
            <p class="text-base"><em>${newsItem.sentiment}</em></p>
            <p class="text-base">${newsItem.newsText}</p>
        `;

        // Display button or indication based on the 'isDisplayed' property
        if (newsItem.isDisplayed) {
            const displayedIndicator = document.createElement('p');
            displayedIndicator.className = 'text-green-500 mt-2';
            displayedIndicator.textContent = 'Displayed';
            newsCard.appendChild(displayedIndicator);
            console.log('Adding Republish button for:', newsItem._id);

            // Add Republish button if the news has been displayed
            const republishButton = document.createElement('button');
            republishButton.className = 'mt-2 p-2 bg-yellow-500 text-white rounded-md';
            republishButton.textContent = 'Republish';
            republishButton.addEventListener('click', async function () {
                try {
                    const republishEndpoint = `http://165.232.183.231/api/v1/news/republish?id=${newsItem._id}`;
                    const republishResponse = await fetch(republishEndpoint, { method: 'POST' });
                    
                    if (republishResponse.status === 200) {
                        alert(`News republished successfully!`);
                        console.log('Adding BRepublish button for:', newsItem._id);
                        // You can refresh the stock details or perform other actions
                    } else {
                        alert(`Failed to republish news. Server responded with status ${republishResponse.status}`);
                    }
                } catch (error) {
                    console.error('Error republishing news:', error);
                    alert('An error occurred while republishing news. Please try again.');
                }
            });

            newsCard.appendChild(republishButton);
        } else {
            const publishButton = document.createElement('button');
            publishButton.className = 'mt-2 p-2 bg-blue-500 text-white rounded-md';
            publishButton.textContent = 'Publish';
            publishButton.addEventListener('click', async function () {
                try {
                    const publishEndpoint = `http://165.232.183.231/api/v1/news/publish?id=${newsItem._id}`;
                    const publishResponse = await fetch(publishEndpoint, { method: 'POST' });

                    if (publishResponse.status === 200) {
                        alert(`News published successfully!`);
                        // getStockDetails(); // Optional: Refresh stock details after publishing
                    } else {
                        alert(`Failed to publish news. Server responded with status ${publishResponse.status}`);
                    }
                } catch (error) {
                    console.error('Error publishing news:', error);
                    alert('An error occurred while publishing news. Please try again.');
                }
            });

            newsCard.appendChild(publishButton);
        }

        container.appendChild(newsCard);
    }
}


// async function login() {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     try {
//         const loginApiUrl = 'https://stock-market-simulator-qn698.ondigitalocean.app/api/v1/brokers/auth';

//         const response = await fetch(loginApiUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 username: username,
//                 password: password,
//             }),
//         });
//         console.log(response);
//         if (response.status === 200) {
        
//             document.getElementById('loginForm').classList.add('hidden');
//             document.getElementById('dashboard').classList.remove('hidden');

//         } else if(response.status === 403) {
//             // Handle login failure
//             alert(`Login failed. Authentication failed`);
//         } else {
//             alert('Login failed. An unexpected error occurred.');
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         alert('Login failed. An unexpected error occurred.');
//     }
// }
//document.getElementById('loginBtn').addEventListener('click', login);
getStockDetails();