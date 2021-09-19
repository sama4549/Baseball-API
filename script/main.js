// Event Listeners
window.addEventListener('DOMContentLoaded', fetchData);

// Variables
const pitcherTable = document.getElementById('pitcher-table');

// Fetch Baseball data
function fetchData() {
    fetch("http://lookup-service-prod.mlb.com/json/named.roster_40.bam?team_id='142'")
    .then(response => {
        if(response.status !== 200) {
            console.log('Something went wrong')
        } else {
            return response.json()
        }
    })
    .then(data => {
        console.log('40 Man Roster' , data);
        obtainPitchers(data);
    })
    .catch(err => {
        console.log(err);
    });
}

// Obtain List of Players
function obtainPitchers(data) {
    let playersArray = data.roster_40.queryResults.row;
    playersArray.forEach(player => {
        let name = player.name_display_first_last;
        let position = player.position_txt;
        let college = player.college;
        let number = player.jersey_number;
        let id = player.player_id;
        let status = player.status_code;

        if(position !== 'P') {
            return;
        }

        // Generate table row
        let newRow = document.createElement('tr');
        newRow.className = 'player-row';
        newRow.setAttribute('data-playerid', id);
        newRow.addEventListener('click', pitcherDetails);

        // Generate Player Name
        let playerName = document.createElement('td');
        playerName.appendChild(document.createTextNode(name));
        newRow.appendChild(playerName);

        // Generate Player Status
        let playerStatus = document.createElement('td');
        let statusTitle;
        switch(status) {
            case 'A':
                statusTitle = 'Active';
                break;
            case 'D10':
                statusTitle = '10-day injured list';
                break;
            case 'ML':
                statusTitle = 'Maternity Leave';
                break;
            case 'RM':
                statusTitle = 'Reassigned';
                break;
            default:
                statusTitle = status;
        }
        playerStatus.appendChild(document.createTextNode(statusTitle));
        newRow.appendChild(playerStatus);

        // Generate Player Position
        let playerPosition = document.createElement('td');
        playerPosition.appendChild(document.createTextNode(position));
        newRow.appendChild(playerPosition);

        // Generate Player College
        let playerCollege = document.createElement('td');
        playerCollege.appendChild(document.createTextNode(college));

        if(college === "") {
            let noData = document.createElement('td');
            noData.appendChild(document.createTextNode(" ' ' "))
            newRow.appendChild(noData);
        } else {
            newRow.appendChild(playerCollege);
        }


        // Generate Player Number
        let playerNumber = document.createElement('td');
        playerNumber.appendChild(document.createTextNode(number));
        
        if(number === "") {
            let noData = document.createElement('td');
            noData.appendChild(document.createTextNode(" ' ' "))
            newRow.appendChild(noData);
        } else {
            newRow.appendChild(playerNumber);
        }

        // Generate Player Record

        // Obtain Pitching Stats
        obtainPitchingStats(id).then(response => {
            let playerRecord = document.createElement('td');

            if (response.sport_pitching_tm.queryResults.totalSize === "0") {
                playerRecord.appendChild(document.createTextNode('No Major League Activity'));
            } else if (response.sport_pitching_tm.queryResults.totalSize === "2" || response.sport_pitching_tm.queryResults.totalSize === "3") {
                let playerRecordSpan = document.createElement('span');
                playerRecord.appendChild(playerRecordSpan);

                playerRecordSpan.appendChild(document.createTextNode(`${response.sport_pitching_tm.queryResults.row[Number(response.sport_pitching_tm.queryResults.totalSize) - 1].w} / ${response.sport_pitching_tm.queryResults.row[Number(response.sport_pitching_tm.queryResults.totalSize) - 1].l}`))
                playerRecord.appendChild(document.createTextNode(` (Acquired from trade with ${response.sport_pitching_tm.queryResults.row[Number(response.sport_pitching_tm.queryResults.totalSize) - 2].team_full})`));
            } else {
                let wins = response.sport_pitching_tm.queryResults.row.w;
                let losses = response.sport_pitching_tm.queryResults.row.l;
                playerRecord.appendChild(document.createTextNode(`${wins} / ${losses}`));
            }

            newRow.appendChild(playerRecord);
        })

        // Generate Player Pitching ERA

        // Obtain Player Pitching Stats
        obtainPitchingStats(id).then(response => {
            let playerPitchingAverage = document.createElement('td');

            // Get ERA from results data

            // If Player has not played in the majors yet this year
            if (response.sport_pitching_tm.queryResults.totalSize === "0") {
                playerPitchingAverage.appendChild(document.createTextNode('No Major League Stats'));

                // If Player Acquired By Another Team Mid-Season
            } else if (response.sport_pitching_tm.queryResults.totalSize === "2" || response.sport_pitching_tm.queryResults.totalSize === "3") {
                let playerPitchingAverageSpan = document.createElement('span');
                playerPitchingAverage.appendChild(playerPitchingAverageSpan);

                playerPitchingAverageSpan.appendChild(document.createTextNode(`${response.sport_pitching_tm.queryResults.row[Number(response.sport_pitching_tm.queryResults.totalSize) - 1].era}`))
                playerPitchingAverage.appendChild(document.createTextNode(` (Acquired from trade with ${response.sport_pitching_tm.queryResults.row[Number(response.sport_pitching_tm.queryResults.totalSize) - 2].team_full})`));

                // Get ERA Color
                let returedColor = colorEra(response.sport_pitching_tm.queryResults.row[Number(response.sport_pitching_tm.queryResults.totalSize) - 1].era);
                playerPitchingAverageSpan.style.color = returedColor;
                playerPitchingAverageSpan.classList.add('player-era');

            } else {
                playerPitchingAverage.appendChild(document.createTextNode(response.sport_pitching_tm.queryResults.row.era));

                // Get ERA Color
                let returedColor = colorEra(response.sport_pitching_tm.queryResults.row.era);
                playerPitchingAverage.style.color = returedColor;
                playerPitchingAverage.classList.add('player-era');
            }
            newRow.appendChild(playerPitchingAverage);
            pitcherTable.childNodes[3].appendChild(newRow);
        });
    });
}

// Obtain Player Statistics
function obtainPitchingStats(playerId) {

    return fetch(`http://lookup-service-prod.mlb.com/json/named.sport_pitching_tm.bam?league_list_id='mlb'&game_type='R'&season='2021'&player_id='${playerId}'`)
    .then(response => {
        if(response.status !== 200) {
            console.log('Something went wrong');
        } else {
            return response.json()
        }
    })
    .then(data => {
        return data;
    })
    .catch(err => {
        console.log(err);
    });
}

function obtainPitchingInfo(playerId) {
    return fetch(`http://lookup-service-prod.mlb.com/json/named.player_info.bam?sport_code='mlb'&player_id=${playerId}`)
    .then(response => {
        if(response.status !== 200) {
            console.log('Something went wrong');
        } else {
            return response.json()
        }
    })
    .then(data => {
        return data;
    })
    .catch(err => {
        console.log(err);
    })
}

// Function to execute on click
function pitcherDetails(e) {
    // Get player ID
    let selectedPlayer;
    let selectedPlayerName;
    if (e.target.parentElement.getAttribute('data-playerid') === null) {
        selectedPlayer = e.target.parentElement.parentElement.getAttribute('data-playerid');
    } else {
        selectedPlayer = e.target.parentElement.getAttribute('data-playerid');
        console.log('selected player else', selectedPlayer);
        selectedPlayerName = e.target.parentElement.childNodes[0].innerText;
    }

    // Obtain Pitching Stats

    async function obtainAdvancedStats() {
        let stats = await obtainPitchingStats(selectedPlayer);
        console.log('Testing async' , stats);
        return stats;
    }

    // Obtain Pitching Info
    async function obtainPlayerData() {
        let data = await obtainPitchingInfo(selectedPlayer);
        console.log('Testing another async' , data);
        return data;
    }


    
    // Create Modal
    async function createModal() {
        let playerStat = await obtainAdvancedStats();
        let playerInfo = await obtainPlayerData();
        console.log('player Stats' , playerStat.sport_pitching_tm.queryResults.row);
        console.log('Player Info' , playerInfo.player_info.queryResults.row);
        if (playerStat.sport_pitching_tm.queryResults.row === undefined) {
            console.log('No player Stats');
            let modal = document.getElementById('modal');
            modal.classList.add('modal-active');
            let modalInformation = document.createElement('div');
            modalInformation.classList.add('modal-information');
            modal.appendChild(modalInformation);
            modalInformation.innerHTML = 'No Stats for this player currently';
            return;
        }

        //Organize Player Stats
        const playerStats = [
            {pitcherEra: playerStat.sport_pitching_tm.queryResults.row.era},
            {pitcherWhip: playerStat.sport_pitching_tm.queryResults.row.whip},
            {inningsPitched: playerStat.sport_pitching_tm.queryResults.row.ip},
            {gamesPlayed: playerStat.sport_pitching_tm.queryResults.row.g},
            {saves: playerStat.sport_pitching_tm.queryResults.row.sv},
            {strikeOuts: playerStat.sport_pitching_tm.queryResults.row.so},
            {walks: playerStat.sport_pitching_tm.queryResults.row.bb},
            {strikeOutsPerNineInnings: playerStat.sport_pitching_tm.queryResults.row.k9}
        ];

        // Organize Player Info
        const playerInformation = [
            {age: playerInfo.player_info.queryResults.row.age},
            {bats: playerInfo.player_info.queryResults.row.bats},
            {birthCountry: playerInfo.player_info.queryResults.row.birth_country},
            {college: playerInfo.player_info.queryResults.row.college},
            {throws: playerInfo.player_info.queryResults.row.throws},
            {heightFeet: playerInfo.player_info.queryResults.row.height_feet},
            {heightInches: playerInfo.player_info.queryResults.row.height_inches},
            {status: playerInfo.player_info.queryResults.row.status},
            {weight: playerInfo.player_info.queryResults.row.weight}
        ];

        let modal = document.getElementById('modal');
        modal.classList.add('modal-active');
        let modalInformation = document.createElement('div');
        modalInformation.classList.add('modal-information');
        modal.appendChild(modalInformation);
    
        modalInformation.innerHTML = `
            <div class="table-container">
                <div class="modal-header-container">
                    <h1>${selectedPlayerName}</h1>
                </div>
                <div class="modal-content-container">
                    <div class="modal-table-left">
                        <h1>Game Stats</h1>
                        <table>
                            <tr>
                                <td>ERA: ${playerStats[0].pitcherEra}</td>
                            </tr>
                            <tr>
                                <td>WHIP: ${playerStats[1].pitcherWhip}</td>
                            </tr>
                            <tr>
                                <td>InningsPitched: ${playerStats[2].inningsPitched}</td>
                            </tr>
                            <tr>
                                <td>GamesPlayed: ${playerStats[3].gamesPlayed}</td>
                            </tr>
                            <tr>
                                <td>Saves: ${playerStats[4].saves}</td>
                            </tr>
                            <tr>
                                <td>Strikeouts: ${playerStats[5].strikeOuts}</td>
                            </tr>
                            <tr>
                                <td>Walks: ${playerStats[6].walks}</td>
                            </tr>
                            <tr>
                                <td>Strikeouts Per 9 Innings: ${playerStats[7].strikeOutsPerNineInnings}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="modal-table-right">
                        <h1>Personal Stats</h1>
                        <table>
                            <tr>
                                <td>Age: ${playerInformation[0].age}</td>
                            </tr>
                            <tr>
                                <td>Bats: ${playerInformation[1].bats}</td>
                            </tr>
                            <tr>
                                <td>Birth Country: ${playerInformation[2].birthCountry}</td>
                            </tr>
                            <tr>
                                <td>College: ${playerInformation[3].college}</td>
                            </tr>
                            <tr>
                                <td>Throws: ${playerInformation[4].throws}</td>
                            </tr>
                            <tr>
                                <td>Height: ${playerInformation[5].heightFeet}' ${playerInformation[6].heightInches}"</td>
                            </tr>
                            <tr>
                                <td>Weight: ${playerInformation[7].weight}</td>
                            </tr>
                            <tr>
                                <td>Status: ${playerInformation[8].status}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="modal-link-container">
                    <a target="_blank" href="http://www.google.com/search?q=${selectedPlayerName}"><h1>Click Here to research player</h1></a>
                </div>
            </div>
        `;
    }
    createModal()
    

    listenForClose();
}

// Event Listener to back out of modal mode
function listenForClose() {
    document.querySelector('body').addEventListener('click', e => {
        let clickedTarget = e.target.className;
        switch(clickedTarget) {
            case 'modal-active':
                document.getElementById('modal').classList.remove('modal-active');
                document.querySelector('.modal-information').remove();
                break;
            default:
                console.log('not success');
        }
    })
}

// Determined color of ERA
function colorEra(eraString) {
    let era = parseFloat(eraString);
    switch (true) {
        case era <= 2.00:
            return 'Darkgreen';
        case era > 2.00 && era <= 3.00:
            return 'Green';
        case era > 3.00 && era <= 4.00:
            return 'Lightgreen';
        case era > 4.00 && era <= 5.00:
            return 'Orange';
        case era > 5.00 && era <= 6.00:
            return 'orangered';
        case era > 6.00:
            return 'red';
        default:
            console.log('Result Defaulted... Something went wrong');
    }

}