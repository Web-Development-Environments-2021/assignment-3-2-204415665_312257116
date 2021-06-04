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



//------------------------------------------------------------------------------------ //
// -----------------------------   SQL_searchByQuery   ------------------------------- //
//------------------------------------------------------------------------------------ //
/**
 * --------------------------SQL_searchByQuery--------------------------
 * @param {*} Search_Query The query the user entered
 * @param {*} Search_Type According to what the user wanted to search for - a team or a player
 * @param {*} Sort_Teams_Alphabetical Sort the players in alphabetical order (yes/no)
 * @param {*} Sort_Players Does the user want to sort the players?
 * @param {*} Sort_Players_By Sort players by team name\player name 
 * @param {*} Filter_Players Filter players by team name or player number
 * @returns List of players / teams that meet all of the above criteria
 */
 async function SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players) {

  const Qsearch = await getQueryInfo(Search_Query, Search_Type);
  let resultQ;

//-------------------------------------- Teams --------------------------------------//
  if(Search_Type=="Teams" ){

    if(Sort_Teams_Alphabetical=="yes"){
      //Sort the teams in alphabetical order by teamName
      Qsearch.sort((a, b) => 
      (('' + a["teamName"]).localeCompare(b["teamName"])));
    }
    resultQ = Qsearch;    
    return { teams: Qsearch };
  }
//-------------------------------------- Players --------------------------------------//

  else if(Search_Type=="Players"){
    if(Sort_Players=="yes"){

    // ------ Sort_Players_By players name ------ //

      if (Sort_Players_By=="own name"){
        Qsearch.sort((a, b) => 
        ((''+a["name"]).localeCompare(b["name"])));
      }

    // ------ Sort_Players_By team name ------ //

      else if (Sort_Players_By=="team name"){
        Qsearch.sort((a, b) => 
        ((''+a["team_name"]).localeCompare(b["team_name"])));

      }
    }
    // ------ Filter_Players ------ //
    if (Filter_Players != undefined || Filter_Players > 0){

    // ------ Filter_Players - position ------ //

      if (!isNaN(Filter_Players)){
        resultQ = Qsearch.filter(function (el) {return el.position == Filter_Players});
      }

    // ------ Filter_Players - teams name ------ //
      else{
        resultQ = Qsearch.filter(function (el) {return el.team_name.includes(Filter_Players)});
      }
    }
    
  }
  return { players: resultQ };
}
exports.SQL_searchByQuery = SQL_searchByQuery;


/**
 * --------------------------getQueryInfo--------------------------
 * @param {*} Search_Query The query the user entered
 * @param {*} Search_Type According to what the user wanted to search for - a team or a player 
 * @returns List of objects by the selected search method
 */
async function getQueryInfo(Search_Query, Search_Type) {
  var include_params;
  let promises = [];
  if (Search_Type =="Players"){  //A switch that differentiates between teams and players
    include_params = `team`;
  }
  Search_Type =Search_Type.toLowerCase();
  promises.push(
    axios.get(`${api_domain}/${Search_Type}/search/${Search_Query}`, {
      params: {
        api_token: process.env.api_token,
        include: `${include_params}`,
      },
    })
  ) 
  let Query_info = await Promise.all(promises);
  return extractRelevantQueryInfo(Query_info[0].data.data, Search_Type).filter(function (el) {return el != null});
}

//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

async function extractRelevantQueryInfo(Query_info, Search_Type) {
//Auxiliary function - returns the relevant information about the array of elements - teams / players.
  var CURRENT_SEASON_ID = await getCurrentSeasonID();
  return  Query_info.map((element) => {
    
    if (Search_Type == "teams" && relevant_team_check(element, CURRENT_SEASON_ID)){
      return {

        teamName: element.name,
        teamLogo: element.logo_path
        
      };
    }
    else if (Search_Type == "players" && relevant_player_check(element, CURRENT_SEASON_ID)){
      return {

        playerID:element.player_id,
        name: element.fullname,
        image: element.image_path,
        position: element.position_id,
        team_name: element.team.data.name

      };
    }
  });
 }
 
 exports.getQueryInfo = getQueryInfo;

 //* ---------------------------- relevant_player_check ---------------------------- *//
 //**Checks if the current player has a team, and checks if he is relevant according to the current league */
function relevant_player_check(element, CURRENT_SEASON_ID) {
  if ('team' in element &&  element.team.data.current_season_id == CURRENT_SEASON_ID){
    return true;
  }
  else{
    return false;
  }
}
//* ---------------------------- relevant_team_check ---------------------------- *//
 //**Checks if the current team is relevant according to the current league*/
function relevant_team_check(element, CURRENT_SEASON_ID) {
  if (element.current_season_id == CURRENT_SEASON_ID){
    return true;
  }
  else{
    return false;
  }
}