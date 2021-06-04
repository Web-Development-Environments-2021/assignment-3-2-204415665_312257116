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

  if (Search_Type =="Players"){  //A switch that differentiates between teams and players
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
  else{
     QueryRelevantInfo = await getAllRelevantTeams(Search_Query, Query_info[0].data.data);
  }

  return QueryRelevantInfo;
}
exports.getQueryInfo = getQueryInfo;


//* ---------------------------- extractRelevantPlayerData ---------------------------- *//
//Auxiliary function - returns the relevant information about the array of elements - teams / players.

async function getAllRelevantTeams(Search_Query,Query_info) {
  teams_arr = Query_info.map((element) => {
    if (element.name.toLowerCase().includes(Search_Query.toLowerCase())){
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

async function getAllRelevantPlayers(Search_Query, Query_info) {

  var player_arr =  (await Promise.all(Query_info.map(async (team_info) => {
    squad_info=team_info.squad.data;
    return squad_info.map((player_info) => {
      const { player_id, position_id, fullname, image_path} = player_info.player.data;

      if(fullname!=null && fullname.toLowerCase().includes(Search_Query.toLowerCase())){
        return {
          playerID: player_id,
          name: fullname,
          image: image_path,
          position: position_id,
          team_name: team_info.name
        };
      }
    });
  })));
  var last_players_standing=[];
  player_arr.map((element) => {
    element.map((item) => {
      if (item != undefined){
        last_players_standing.push(item)
      }
    })});
  return last_players_standing;
}
exports.getAllRelevantPlayers = getAllRelevantPlayers;




//  //* ---------------------------- relevant_player_check ---------------------------- *//
//  //**Checks if the current player has a team, and checks if he is relevant according to the current league */
// function relevant_player_check(element, CURRENT_SEASON_ID) {
//   if ('team' in element &&  element.team.data.current_season_id == CURRENT_SEASON_ID){
//     return true;
//   }
//   else{
//     return false;
//   }
// }
// //* ---------------------------- relevant_team_check ---------------------------- *//
//  //**Checks if the current team is relevant according to the current league*/
// function relevant_team_check(element, CURRENT_SEASON_ID) {
//   if (element.current_season_id == CURRENT_SEASON_ID){
//     return true;
//   }
//   else{
//     return false;
//   }
// }


// /**
//  * --------------------------getQueryInfo--------------------------
//  * @param {*} Search_Query The query the user entered
//  * @param {*} Search_Type According to what the user wanted to search for - a team or a player 
//  * @returns List of objects by the selected search method
//  */
// async function getQueryInfo(Search_Query, Search_Type) {
//   var include_params;
//   let promises = [];
//   if (Search_Type =="Players"){  //A switch that differentiates between teams and players
//     include_params = `team`;
//   }
//   Search_Type =Search_Type.toLowerCase();
//   promises.push(
//     axios.get(`${api_domain}/${Search_Type}/search/${Search_Query}`, {
//       params: {
//         api_token: process.env.api_token,
//         include: `${include_params}`,
//       },
//     })
//   ) 
//   let Query_info = await Promise.all(promises);
//   var QueryRelevantInfo = await extractRelevantQueryInfo(Search_Query, Query_info[0].data.data, Search_Type);
//   return (QueryRelevantInfo).filter(function (el) {return el != null});
// }



// //* ---------------------------- extractRelevantPlayerData ---------------------------- *//

// async function extractRelevantQueryInfo(Search_Query,Query_info, Search_Type) {
// //Auxiliary function - returns the relevant information about the array of elements - teams / players.
//   var CURRENT_SEASON_ID = await getCurrentSeasonID();

//   var y = (await getAllRelevantPlayers(Search_Query,CURRENT_SEASON_ID));
//   for ( var i=0 ; i < y.length ; i++ ){
//     y[i]=y[i].filter(function (el) {return el != null});
//   }
//   y=y.filter(function (el) {return el.length > 0});
  
//   return Query_info.map((element) => {
//     if (Search_Type == "teams" && relevant_team_check(element, CURRENT_SEASON_ID)){
//       return {

//         teamName: element.name,
//         teamLogo: element.logo_path
        
//       };
//     }
//     else if (Search_Type == "players" && relevant_player_check(element, CURRENT_SEASON_ID)){
//       return {

//         playerID:element.player_id,
//         name: element.fullname,
//         image: element.image_path,
//         position: element.position_id,
//         team_name: element.team.data.name

//       };
//     }
//   });
//  }
 
//  exports.getQueryInfo = getQueryInfo;

//  //* ---------------------------- relevant_player_check ---------------------------- *//
//  //**Checks if the current player has a team, and checks if he is relevant according to the current league */
// function relevant_player_check(element, CURRENT_SEASON_ID) {
//   if ('team' in element &&  element.team.data.current_season_id == CURRENT_SEASON_ID){
//     return true;
//   }
//   else{
//     return false;
//   }
// }
// //* ---------------------------- relevant_team_check ---------------------------- *//
//  //**Checks if the current team is relevant according to the current league*/
// function relevant_team_check(element, CURRENT_SEASON_ID) {
//   if (element.current_season_id == CURRENT_SEASON_ID){
//     return true;
//   }
//   else{
//     return false;
//   }
// }
// async function getAllRelevantPlayers(Search_Query,CURRENT_SEASON_ID) {
//   let promises = [];
//   var CURRENT_SEASON_ID = await getCurrentSeasonID();
//   promises.push(
//     axios.get(`${api_domain}/teams/season/${CURRENT_SEASON_ID}`, {
//       params: {
//         api_token: process.env.api_token,
//         include:"squad.player",
//       },
//   }));

//   let season_Team_info = await Promise.all(promises);
//   season_Team_info= season_Team_info[0].data.data;
//   return (await Promise.all(season_Team_info.map(async (team_info) => {
//     const {  name, squad } = team_info;
//     squad_info=squad.data;
//     return squad_info.map((player_info) => {
//       const { player_id, position_id, fullname, image_path} = player_info.player.data;
//       if(fullname!=null && fullname.includes(Search_Query)){
//         return {
//           playerID: player_id,
//           name: fullname,
//           image: image_path,
//           position: position_id,
//           team_name: name
  
//         };
//       }

//     });
//   })));
// } exports.getAllRelevantPlayers = getAllRelevantPlayers;