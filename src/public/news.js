let newsApiUrl = '';

// Function to fetch news data from the API
async function fetchNews() {
    const stockId = getURLParameter('id');
    newsApiUrl = `http://165.232.183.231/api/v1/news/getNewsbyFilter?stocks=${stockId}&sentiment=all`;
    try {
        const response = await fetch(newsApiUrl);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching news:', error);
        return null;
    }
}

// Function to update the news section
async function updateNews() {
    const newsSection = document.getElementById('newsSection');
    
    const newsData = await fetchNews();
    const avlNews = newsData.filter(news => news.isDisplayed);
    if (avlNews) {
        // Clear existing news cards
        newsSection.innerHTML = '';

        // Update news cards
        avlNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'bg-white p-4 rounded-md shadow-md mb-4';

            const timeElement = document.createElement('div');
            timeElement.className = 'text-gray-500 mb-2';
            const time = new Date(news.updatedAt);
            timeElement.textContent = time.toLocaleDateString() + "  "+ time.toLocaleTimeString()
            newsCard.appendChild(timeElement);

            const titleElement = document.createElement('h3');
            titleElement.className = 'text-xl font-bold mb-2';
            titleElement.textContent = news.title;
            newsCard.appendChild(titleElement);

            const textElement = document.createElement('p');
            textElement.className = 'text-gray-600';
            textElement.textContent = news.newsText;
            newsCard.appendChild(textElement);

            newsSection.appendChild(newsCard);
        });

        // Highlight the most recent news
        const firstNewsCard = newsSection.firstChild;
        if (firstNewsCard) {
            firstNewsCard.classList.add('bg-yellow-200');
        }
    }

    // Enable the refresh button after updating news
    
}

// Event listener for the refresh button
document.getElementById('refreshNews').addEventListener('click', function () {
    updateNews();
});

// Initial news update
updateNews();
