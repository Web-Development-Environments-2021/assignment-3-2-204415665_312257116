//init
const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//------------------------------------------------------------------------------------ //
// -----------------------------   SQL_searchByQuery   ------------------------------- //
//------------------------------------------------------------------------------------ //

function SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players) {
    const Qsearch = getQueryInfo(Search_Query, Search_Type);
    
    return Qsearch;
}
exports.SQL_searchByQuery = SQL_searchByQuery;


// //* ------------------------------ getMatchesInfo ------------------------------ *//

async function getQueryInfo(Search_Query, Search_Type) {

  let promises = [];
  var include_params;

  if (Search_Type == "Teams"){
    Search_Type="teams"
    // include_params = `squad.player , league`;
  }
  else{
    Search_Type="players"
    include_params = `team`;
  }

  promises.push(
        axios.get(`${api_domain}/${Search_Type}/search/${Search_Query}`, {
        params: {
          api_token: process.env.api_token,
          include: `${include_params}`,
        },
      })
  ) 
  let Query_info = await Promise.all(promises);
  return extractRelevantQueryInfo(Query_info, Search_Type);
}


//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantQueryInfo(Query_info, Search_Type) {

  return Query_info.map((curr_item) => {
    if (Search_Type == "teams"){
      const { name } = curr_item.data.data[0];
      const { logo_path } = curr_item.data.data[0];
      return {
        teamName: name,
        teamLogo: logo_path,
      };
    }
    else{
      const { teamName } = Query_info.data.data["name"];
  
      // "name"
      // "image"
      // "position"
      // "team_name"
      return {
        matchDate: date_time,
        localTeamName: homeTeamName,
        visitorTeamName: awayTeamName,
        venueName: stadium,
      };
    }

  });
}

exports.getQueryInfo = getQueryInfo;



// ----------------------------------------------------------------------------------- //
// -----------------------------------   getters   ----------------------------------- //
// ----------------------------------------------------------------------------------- //

//* ------------------------------ getFavoritePlayers ------------------------------ *//

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}
exports.getFavoritePlayers = getFavoritePlayers;

// --------------------   get  user Favorites Teams   ---------------------------- //

async function getFavoriteMatches(user_id) {
  const match_ids = await DButils.execQuery(
    `select match_id from FavoriteMatches where user_id='${user_id}'`
  );
  return match_ids;
}
exports.getFavoriteMatches = getFavoriteMatches;

// --------------------   get User Favorites Teams   ---------------------------- //

async function getFavoriteTeams(user_id) {
  const team_ids = await DButils.execQuery(
    `select team_id from FavoriteTeams where user_id='${user_id}'`
  );
  return team_ids;
}
exports.getFavoriteTeams = getFavoriteTeams;







//------------------------------------------------------------------------------------ //
// -------------------------------   remove function   ------------------------------- //
//------------------------------------------------------------------------------------ //


// --------------------   remove from Favorites Players    ------------------------ //
// remove a Players from User Favorites Teams
async function removePlayersFromFavorite(user_id, player_id) {
  await DButils.execQuery(
    `DELETE  FROM  FavoritePlayers WHERE user_id='${user_id}' AND player_id='${player_id}'`
  );
}
exports.removePlayersFromFavorite = removePlayersFromFavorite;

// --------------------   remove from Favorites Matches    ------------------------ //
// remove a Matches from User Favorites Matches
async function removeMatchesFromFavorite(user_id, match_id) {
  await DButils.execQuery(
    `DELETE  FROM  FavoriteMatches WHERE user_id='${user_id}' AND team_id='${match_id}'`
  );
}
exports.removeMatchesFromFavorite = removeMatchesFromFavorite;

// --------------------   remove from Favorites TeamS    --------------------------- //
// remove a Team from User Favorites Teams
async function removeTeamsFromFavorite(user_id, team_id) {
  await DButils.execQuery(
    `DELETE  FROM  FavoriteTeams WHERE user_id='${user_id}' AND team_id='${team_id}'`
  );
}
exports.removeTeamsFromFavorite = removeTeamsFromFavorite;





//------------------------------------------------------------------------------------//
// -------------------------------   insert function   -------------------------------//
//------------------------------------------------------------------------------------//


// --------------------   Favorites Player insert   ----------------------------//
// add a Player to User Favorites Players

async function markPlayerAsFavorite(user_id, player_id) {
  var userFavoritePlayer = getFavoriteTeams(user_id);
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id})`
  );
}
exports.markPlayerAsFavorite = markPlayerAsFavorite;

// --------------------   Favorites Matched insert   ----------------------------//
// add a Matched to User Favorites Matches

async function markMatchesAsFavorite(user_id, match_id) {
    await DButils.execQuery(
      `insert into FavoriteMatches values 
       SELECT * FROM (SELECT '${user_id}',${match_id}) AS tmp
       WHERE NOT EXISTS (SELECT user_id,match_id FROM FavoriteMatches WHERE user_id = '${user_id}' AND match_id = '${match_id}') LIMIT 1`
    );
}

exports.markMatchesAsFavorite = markMatchesAsFavorite;


// ----------------------------   Favorites Teams insert   ---------------------------- //
// add a Team to User Favorites Teams

async function markTeamsAsFavorite(user_id, team_id) {
  await DButils.execQuery(
    `insert into FavoriteTeams values ('${user_id}',${team_id})`
  );
}
exports.markTeamsAsFavorite = markTeamsAsFavorite;

