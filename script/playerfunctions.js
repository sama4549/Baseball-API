// Obtain Batting Statistics
export function obtainBattingStats(playerId) {

    return fetch(`http://lookup-service-prod.mlb.com/json/named.sport_career_hitting.bam?league_list_id='mlb'&game_type='R'&player_id=${playerId}`)
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

// Obtain Pitcher Statistics
export function obtainPitchingStats(playerId) {

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

// Obtain Basic Player Info
export function obtainPlayerInfo(playerId) {
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

// Determined color of ERA
export function colorEra(eraString) {
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