
const users_utils = require("../utils/users_utils");

//* ------------------------------ getFavoriteMatches_domain ------------------------------ *//

async function getFavoriteMatches_domain(user_id){
    const matches_ids = await users_utils.getFavoriteMatches(user_id);
    let matches_ids_array = [];
    matches_ids.map((element) => matches_ids_array.push(element.match_id));
    return matches_ids_array;
}
exports.getFavoriteMatches_domain = getFavoriteMatches_domain;

//* ------------------------------ markMatchesAsFavorite_domain ------------------------------ *//

async function markMatchesAsFavorite_domain(user_id, match_id){
    const message = await users_utils.markMatchesAsFavorite(user_id, match_id);
    return message;
}
exports.markMatchesAsFavorite_domain = markMatchesAsFavorite_domain;


//* ------------------------------ Check Input Delete Favorite Match ------------------------------ *//
    
async function deleteUserFavoriteMatch(user_id, matchID){
     
    var badRequest = false;
    var message = "";
  
    if ( Number.isInteger(matchID) && matchID >= 1){
      
        var isFavoriteMatch = await users_utils.removeFavoriteMatchByUser(user_id, matchID);
  
        if ( ! isFavoriteMatch ){
            badRequest = true;
            message = "Match not found";
        }
  
    } else{
        badRequest = true;
        message = " match ID in not int,";
    }
  
    return { badRequest : badRequest, message : message };
  
}
exports.deleteUserFavoriteMatch = deleteUserFavoriteMatch;