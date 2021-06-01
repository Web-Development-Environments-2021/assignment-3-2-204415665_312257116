//init
const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const matches_utils = require("./matches_utils");
const { exists } = require("fs");

LEAGUE_ID = 271;
CURRENT_SEASON_ID = 17328;


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

//* ------------------------------ getMatchesInfo ------------------------------ *//

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
  return extractRelevantQueryInfo(Query_info[0].data.data, Search_Type)
  .filter(function (el) {return el != null});
}

//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantQueryInfo(Query_info, Search_Type) {
//Auxiliary function - returns the relevant information about the array of elements - teams / players.
  return  Query_info.map((element) => {

    if (Search_Type == "teams" && relevant_team_check(element)){
      return {

        teamName: element.name,
        teamLogo: element.logo_path
        
      };
    }
    else if (Search_Type == "players" && relevant_player_check(element)){
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
function relevant_player_check(element) {
  if ('team' in element /*&&  element.team.data.current_season_id == CURRENT_SEASON_ID*/){
    return true;
  }
  else{
    return false;
  }
}
//* ---------------------------- relevant_team_check ---------------------------- *//
 //**Checks if the current team is relevant according to the current league*/
function relevant_team_check(element) {
  if (element.current_season_id == CURRENT_SEASON_ID){
    return true;
  }
  else{
    return false;
  }
}
// --------------------   get  user Favorites Matches   ---------------------------- //

async function getFavoriteMatches(user_id) {
  const match_ids = await DButils.execQuery(
    `select match_id from FavoriteMatches where user_id='${user_id}'`
  );
  return match_ids;
}
exports.getFavoriteMatches = getFavoriteMatches;

// --------------------   Favorites Matched insert   ----------------------------//

// add a Matched to User Favorites Matches

async function markMatchesAsFavorite(user_id, match_id) {
  if (user_id && match_id)
   {            
      const userFavoriteMatches = await getFavoriteMatches(user_id);
      var flag = false;
      const checkMatch_exist = await matches_utils.getMatchByID(match_id);
      if (!userFavoriteMatches.find((x) => x.match_id == match_id) && checkMatch_exist.length > 0) {
            DButils.execQuery(`insert into FavoriteMatches values ('${user_id}',${match_id})`);
            flag = true;
      }
    }  
  
  return flag;
}exports.markMatchesAsFavorite = markMatchesAsFavorite;


