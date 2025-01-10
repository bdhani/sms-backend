document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch all teams
        const allTeams = await fetchAllTeams();
        const teamsContainer = document.getElementById('teamsContainer');

        const teams = allTeams.filter(ele => !ele.isDummy);
        console.log(teams)

        // Iterate over each team and create a team card
        for (const team of teams) {
            
            

            // Create team card
            const teamCard = document.createElement('div');
            teamCard.className = 'bg-white p-4 rounded-md shadow-md mb-4';

            teamCard.innerHTML = `
                <p class="text-lg font-bold">Team ID: ${team.teamId}</p>
                <p class="text-lg font-bold">Team Name: ${team.teamName}</p>
                <p>Team Members:</p>
                <ul>
                    ${team.members.map(member => `<li>${member.name}</li>`).join('')}
                </ul>
                
            `;

            teamsContainer.appendChild(teamCard);
        }
    } catch (error) {
        console.error('Error fetching teams and team details:', error);
        alert('An error occurred while fetching teams and team details. Please try again.');
    }
});

// Function to fetch all teams
async function fetchAllTeams() {
    try {
        const teamsEndpoint = 'http://165.232.183.231/api/v1/teams/getAllTeams';
        const response = await fetch(teamsEndpoint);
        const data = await response.json();
        return data.data;
    } catch (error) {
        throw new Error('Error fetching teams:', error);
    }
}

// Function to fetch team worth by team ID
async function fetchTeamWorth(teamId) {
    try {
        const teamWorthEndpoint = `http://165.232.183.231/api/v1/teams/getWorth?id=${teamId}`;
        const response = await fetch(teamWorthEndpoint);
        const data = await response.json();
        return data.data.totalWorth;
    } catch (error) {
        throw new Error(`Error fetching team worth for team ID ${teamId}:`, error);
    }
}
