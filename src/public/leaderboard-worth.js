document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch leaderboard data
        const leaderboardData = await fetchLeaderboard();
        const leaderboardTable = document.getElementById('leaderboardTable');

        // Iterate over teams and render the leaderboard table
        leaderboardData.forEach((team, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="number">${index + 1}</td>
                <td class="points">₹${team.totalWorth.toFixed(2)}</td>
            `;
            leaderboardTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        alert('An error occurred while fetching leaderboard data. Please try again.');
    }
});

// Function to fetch leaderboard data
async function fetchLeaderboard() {
    try {
        const leaderboardEndpoint = 'http://165.232.183.231/api/v1/teams/getLeaderboard';
        const response = await fetch(leaderboardEndpoint);
        const data = await response.json();
        return data.data;
    } catch (error) {
        throw new Error('Error fetching leaderboard data:', error);
    }
}
