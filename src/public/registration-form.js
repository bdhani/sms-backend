document.addEventListener('DOMContentLoaded', function () {
    const addMemberButton = document.getElementById('addMemberButton');
    const teamMembersContainer = document.getElementById('teamMembersContainer');
    const maxTeamMembers = 3;
    addMemberButton.addEventListener('click', function () {
        const currentMemberCount = teamMembersContainer.querySelectorAll('div').length;
        if (currentMemberCount < maxTeamMembers) {
        const newMemberFields = document.createElement('div');
        newMemberFields.className = 'space-x-4 mt-2';
        newMemberFields.innerHTML = `
            <input type="text" name="memberName" placeholder="Name" class="mb-4 p-2 border border-gray-300 rounded-md" required>
            <input type="email" name="memberEmail" placeholder="Email" class="mb-4 p-2 border border-gray-300 rounded-md">
            <input type="tel" name="memberPhoneNumber" placeholder="Phone Number" class= "mb-4 p-2 border border-gray-300 rounded-md">
            <input type="text" name="memberRollNo" placeholder="Roll Number" class="mb-4 border border-gray-300 rounded-md"required>
        `;
        teamMembersContainer.appendChild(newMemberFields);
        } else {
            alert(`Maximum team members limit reached (${maxTeamMembers}).`);
        }
    });

    // Submit button functionality
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', async function () {
        try {
            const teamData = collectFormData();
            const response = await registerTeam(teamData);
            console.log(response);
            if (response.statusCode===200) {
                alert(`Team registration successful! Team ID: ${response.data.teamId}`);
                clearForm();
            } else {
                alert('Team registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during team registration:', error);
            alert('An error occurred during team registration. Please try again.');
        }
    });
});

// Function to collect form data
function collectFormData() {
    const teamName = document.getElementById('teamName').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Collect team members' details
    const teamMembers = [];
    const memberFields = document.querySelectorAll('#teamMembersContainer > div');


    memberFields.forEach(memberFieldsContainer => {
        const name = memberFieldsContainer.querySelector('input[name="memberName"]').value;
        const email = memberFieldsContainer.querySelector('input[name="memberEmail"]').value;
        const phoneNumber = memberFieldsContainer.querySelector('input[name="memberPhoneNumber"]').value;
        const rollNo = memberFieldsContainer.querySelector('input[name="memberRollNo"]').value;

        teamMembers.push({ name, email, phoneNumber, rollNo });
    });

    return {
        "teamName" : teamName,
        teamDetails: teamMembers,
        "username" : username,
        "password": password,
    };
}

// Function to send a POST request to register a team
async function registerTeam(teamData) {
    try {
        const registrationEndpoint = 'http://165.232.183.231/api/v1/teams/add';
        const response = await fetch(registrationEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamData),
        });
        console.log(JSON.stringify(teamData));
     

        return await response.json();
    } catch (error) {
        console.error('Error during team registration:', error);
        return null;
    }
}

// Function to clear the form after successful registration
function clearForm() {
    document.getElementById('teamName').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    const teamMembersContainer = document.getElementById('teamMembersContainer');
    teamMembersContainer.innerHTML = '';

    // Reset the form to have one member field initially
    const initialMemberFields = document.createElement('div');
    initialMemberFields.className = 'space-x-4 mt-2';
    initialMemberFields.innerHTML = `
        <input type="text" name="memberName" placeholder="Name" class=" border border-gray-300 rounded-md" required>
        <input type="email" name="memberEmail" placeholder="Email" class="p-2 border border-gray-300 rounded-md">
        <input type="tel" name="memberPhoneNumber" placeholder="Phone Number" class=" p-2 border border-gray-300 rounded-md">
        <input type="text" name="memberRollNo" placeholder="Roll Number" class=" p-2 border border-gray-300 rounded-md" required>
    `;
    teamMembersContainer.appendChild(initialMemberFields);
}
