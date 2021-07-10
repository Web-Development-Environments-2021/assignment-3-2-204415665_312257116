const axios = require("axios");
const LEAGUE_ID = 271;
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getLeagueDetails ------------------------------ *//

async function getLeagueDetails() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }

  );
  if (league.data.data.current_stage_id != null){

    const stage = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );

    return {
      league_name: league.data.data.name,
      current_season_name: league.data.data.season.data.name,
      current_stage_name: stage.data.data.name,
      first_next_match: null
      };
  } 
  else {
    return {
      league_name: league.data.data.name,
      current_season_name: league.data.data.season.data.name,
      current_stage_name: 'null',
      first_next_match: null
    };
  }

  
}
exports.getLeagueDetails = getLeagueDetails;


//* ------------------------------ checkTeamName ------------------------------ *//

async function checkTeamNames(localTeamName, visitorTeamName) {
  const season_ID = await getCurrentSeasonID();
  const teams = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/teams/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  
  var badRequest = false;
  var message = "";

  var foundLocalTeam = false;
  var foundVisitorTeam = false;
  if (teams.data.data.find((x) => x.name == localTeamName)){
    foundLocalTeam = true;
  } 
  if( teams.data.data.find((y) => y.name == visitorTeamName )) {
    foundVisitorTeam = true;
  }

  if ( foundLocalTeam && foundVisitorTeam ){
    badRequest = false;
    message = "";

  } else if( foundLocalTeam ){
    badRequest = true;
    message += " visitor team not exist,";
     
  } else if( foundVisitorTeam ){
    badRequest = true;
    message += " local team not exist,";
     
  } else{
    badRequest = true;
    message += " local and visitor team not exist,";
  }

  return { badRequest : badRequest, message : message };

}
exports.checkTeamNames = checkTeamNames;


//* ------------------------------ checkTeamName ------------------------------ *//

async function checkVenueName(venueName) {
  const season_ID = await getCurrentSeasonID();
  const venues = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/venues/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  if (venues.data.data.find((x) => x.name == venueName)) {
    return true;
  }
  return false;
}
exports.checkVenueName = checkVenueName;


//* ------------------------------ get Venues Names ------------------------------ *//

async function getVenuesNames() {
  const season_ID = await getCurrentSeasonID();
  const venues = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/venues/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  var venus_arr = [];
  venues.data.data.map((element) => venus_arr.push(element.name));
  
  return venus_arr;
  
}
exports.getVenuesNames = getVenuesNames;


//* ------------------------------ get Teams Names ------------------------------ *//


async function getTeamsNames() {
  const season_ID = await getCurrentSeasonID();
  const teams = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/teams/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  var teams_arr = [];
  teams.data.data.map((element) => teams_arr.push(element.name));
  return teams_arr;
}
exports.getTeamsNames = getTeamsNames;


//* ------------------------------ get Current Season ID ------------------------------ *//

async function getCurrentSeasonID() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
    return league.data.data.current_season_id;
}
exports.getCurrentSeasonID = getCurrentSeasonID;


/**
 * --------------------------getQueryInfo--------------------------
 * @param {*} Search_Query The query the user entered
 * @param {*} Search_Type According to what the user wanted to search for - a team or a player 
 * @returns List of objects by the selected search method
 */
async function getQueryInfo(Search_Query, Search_Type) {
  var CURRENT_SEASON_ID = await getCurrentSeasonID();
  var include_params;
  var QueryRelevantInfo;
  let promises = [];

  if (Search_Type !="Teams" ){  //A switch that differentiates between teams and players
    include_params = "squad.player";
  }
  promises.push(axios.get(`${api_domain}/teams/season/${CURRENT_SEASON_ID}`, {
      params: {
        api_token: process.env.api_token,
        include: `${include_params}`,
      },
  }))
  let Query_info = await Promise.all(promises);
  if (Search_Type =="Players"){
     QueryRelevantInfo = await getAllRelevantPlayers(Search_Query, Query_info[0].data.data);
  }
  else if(Search_Type =="All"){
      QueryRelevantInfo={};
      QueryRelevantInfo["Players"] = await getAllRelevantPlayers(Search_Query, Query_info[0].data.data, Search_Type);
      QueryRelevantInfo["Teams"] = await getAllRelevantTeams(Search_Query, Query_info[0].data.data, Search_Type);
  }
  else{
     QueryRelevantInfo = await getAllRelevantTeams(Search_Query, Query_info[0].data.data);
  }
  return QueryRelevantInfo;
}
exports.getQueryInfo = getQueryInfo;


//* ---------------------------- extractRelevantPlayerData ---------------------------- *//
//Auxiliary function - returns the relevant information about the array of elements - teams / players.

async function getAllRelevantTeams(Search_Query,Query_info, Search_Type) {

  teams_arr = Query_info.map((element) => {
    var last_players_standing=[];

    if (Search_Type=='All'){
      element.squad.data.forEach((player_info) => {
        const { player_id, position_id, fullname, image_path} = player_info.player.data;
        if(Search_Type=='All'){
          last_players_standing.push(player_id);
        }
      })
      return {
        teamName: element.name,
        teamLogo: element.logo_path,
        teamSquad: last_players_standing
      };
    }
    else if (element.name.toLowerCase().includes(Search_Query.toLowerCase())){
      return {
        teamName: element.name,
        teamLogo: element.logo_path
      };
    }    
  });
  teams_arr=teams_arr.filter(function (el) {return el != null});
  return teams_arr;
}
exports.getAllRelevantTeams = getAllRelevantTeams;


//* ---------------------------- getAllRelevantPlayers ---------------------------- *//
//Auxiliary function - returns the relevant information about the array of elements - teams / players.

async function getAllRelevantPlayers(Search_Query, Query_info, Search_Type) {
  var last_players_standing=[];
  Query_info.forEach(team_info => {
    team_info.squad.data.forEach((player_info) => {
      const { player_id, fullname, image_path, position_id, common_name, nationality, birthdate, birthcountry, height, weight} = player_info.player.data;
      if(Search_Type=='All'){
        last_players_standing.push({
            // playerID: player_id,
            // name: fullname,
            // image: image_path,
            // position: position_id,
            // team_name: team_info.name
            playerShortInfo: {
              playerID: player_id,
              name: fullname,
              image: image_path,
              position: position_id,
              team_name: team_info.name,
            },
            commonName: common_name,
            nationality: nationality,
            birthDate: birthdate,
            birthCountry: birthcountry,
            height: height,
            weight: weight
          

        
      });
    }
    else       if(fullname?.toLowerCase()?.includes(Search_Query?.toLowerCase())){
      last_players_standing.push({
          playerID: player_id,
          name: fullname,
          image: image_path,
          position: position_id,
          team_name: team_info.name
      
    });
  }
  });
  });

  return last_players_standing;
}
exports.getAllRelevantPlayers = getAllRelevantPlayers;
