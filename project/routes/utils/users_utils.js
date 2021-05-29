//init
const DButils = require("./DButils");



//------------------------------------------------------------------------------------//
// -------------------------------   insert function   -------------------------------//
//------------------------------------------------------------------------------------//


// --------------------   Favorites Player insert   ----------------------------//
// add a Player to User Favorites Players

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id})`
  );
}
exports.markPlayerAsFavorite = markPlayerAsFavorite;

// --------------------   Favorites Matche insert   ----------------------------//
// add a Matche to User Favorites Matches

async function markMatchesAsFavorite(user_id, match_id) {
  await DButils.execQuery(
    `insert into FavoriteMatches values ('${user_id}',${match_id})`
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


// ----------------------------------------------------------------------------------- //
// -----------------------------------   getters   ----------------------------------- //
// ----------------------------------------------------------------------------------- //


// --------------------   get user Favorites Players   ----------------------------


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