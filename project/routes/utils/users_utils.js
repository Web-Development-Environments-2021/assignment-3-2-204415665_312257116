
const DButils = require("./DButils");
const matches_utils = require("./matches_utils");



// --------------------   Favorites Matched insert   ----------------------------//

// add a Matched to User Favorites Matches

async function markMatchesAsFavorite(user_id, match_id) {
  let massage= null; 
  if (user_id && match_id)
   {   
    const userFavoriteMatches = await getFavoriteMatches(user_id);
    let checkMatch_exist = await matches_utils.getFutureMatchByID(match_id);
    if (checkMatch_exist.length==0){
      massage = `match id: ${match_id} not exist in future matches table`;
    }
    else if (!userFavoriteMatches.find((x) => x.match_id == match_id) && checkMatch_exist.length > 0) {
          DButils.execQuery(`insert into FavoriteMatches values ('${user_id}',${match_id})`);
          return null;
    }
    else{
      massage = `match id: ${match_id} is already exist in this user favorite matches table`;
    }
  }
  return massage;
}
exports.markMatchesAsFavorite = markMatchesAsFavorite;


// --------------------   get user Favorites Matches   ---------------------------- //

async function getFavoriteMatches(user_id) {
  const match_ids = await DButils.execQuery(
    `Select match_id from FavoriteMatches WHERE user_id=('${user_id}')`
  );
  return match_ids;
}
exports.getFavoriteMatches = getFavoriteMatches;


//* ------------------------------ removeMatchFavorite ------------------------------ *//

async function removeFavoriteMatch(match_id){

  if ( await checkFavoriteMatch(match_id) ){

    await DButils.execQuery(
      `DELETE  FROM  FavoriteMatches WHERE match_id=('${match_id}')`
    );

    return true;
  }
  return false;
  
}
exports.removeFavoriteMatch = removeFavoriteMatch;


//* ------------------------------ Check Favorite Match ------------------------------ *//

async function checkFavoriteMatch(match_id){

  const favoriteMatch =  await DButils.execQuery(
    `Select * from FavoriteMatches WHERE match_id=('${match_id}')`
  );

  if ( favoriteMatch.length != 0 ){
    return true;
  }
  return false;

}
exports.checkFavoriteMatch = checkFavoriteMatch;


//* ------------------------------ removeMatchFavoriteByUser ------------------------------ *//

async function removeFavoriteMatchByUser(user_id, match_id){

  if ( await checkFavoriteMatchByUser(user_id, match_id) ){

    await DButils.execQuery(
      `DELETE  FROM  FavoriteMatches WHERE match_id=('${match_id}') and user_id=('${user_id}')`
    );

    return true;
  }
  return false;
  
}
exports.removeFavoriteMatchByUser = removeFavoriteMatchByUser;


//* ------------------------------ Check Favorite Match By User ------------------------------ *//

async function checkFavoriteMatchByUser(user_id, match_id){

  const favoriteMatch =  await DButils.execQuery(
    `Select * from FavoriteMatches WHERE match_id=('${match_id}') and user_id=('${user_id}')`
  );

  if ( favoriteMatch.length != 0 ){
    return true;
  }
  return false;

}
exports.checkFavoriteMatchByUser = checkFavoriteMatchByUser;
