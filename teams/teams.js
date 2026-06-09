import TeamsService from "../../../shared/services/teams.service.js";

const teamsService = new TeamsService();

async function loadTeams() {
    const teams = await teamsService.get();
    return teams;
}

async function buildTable() {
    const teams = await loadTeams();
    const tableBody = document.getElementById('teams-table-body');
    tableBody.innerHTML = '';

    teams.forEach(team => {
        const row = document.createElement('tr');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', async () => {
            // await teamsService
            console.log(`Delete team with ID: ${team.id}`);
        });

        // <button onclick="viewTeam(${team.id})">View</button>

        const td = document.createElement('td');
        td.appendChild(deleteButton);
        
        row.innerHTML = `
        <td>${team.id}</td>
        <td>${team.name}</td>
        <td>${team.description}</td>
        <td>${team.memberCount}</td>
        `;

        row.appendChild(td);
        tableBody.appendChild(row);
    });
}

buildTable();