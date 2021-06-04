
const league_utils = require("../utils/league_utils");
const matches_utils = require("../utils/matches_utils");
const matches_domain = require("../domains/matches_domain");
const users_domain = require("../domains/user_domain");

//* ------------------------------ Get League Info For Main Page ------------------------------ *//
    
async function getLeagueInfoForMainPage(){
  
    const league_details = await league_utils.getLeagueDetails();

    return league_details;
    
}
exports.getLeagueInfoForMainPage = getLeagueInfoForMainPage;
  

//* ------------------------------ Get Next League Match ------------------------------ *//
    
async function getNextLeagueMatch(){
  
    var first_next_match = await matches_utils.getFirstNextMatch();

    first_next_match = first_next_match.map((element) => {
        return{
            matchID : element.match_id,
            matchDate : matches_domain.getDateTimeDisplayFormat(element.matchDateAndTime),
            localTeamName : element.localTeamName,
            visitorTeamName : element.visitorTeamName,
            venueName : element.venueName,
            refereeID : element.refereeID
        }
    });
    var refereeDic = await matches_utils.extractRefereeInfo(first_next_match[0].refereeID);
    first_next_match[0]["refereeInformation"] = refereeDic[0];

    delete first_next_match[0]["refereeID"];
 
    return first_next_match[0];
    
}
exports.getNextLeagueMatch = getNextLeagueMatch;


//* ------------------------------ SQL Search Domain ------------------------------ *//

async function SQL_search_domain(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players){

    const results = await league_utils.SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players);

    return results
}
exports.SQL_search_domain = SQL_search_domain;


//* ------------------------------ Get Favorite Matches For Main Page ------------------------------ *//
    
async function getFavoriteMatchesForMainPage(user_id){
  
    var favoriteMatchedID = await users_domain.getFavoriteMatches_domain(user_id);

    var favoriteMatchesAfterCheck = [];
    var needChange = false;

    for ( var i=0 ; i < favoriteMatchedID.length ; i++){

        needChange = await matches_domain.checkIfNeedChangeFromFuture(favoriteMatchedID[i]);
        
        if ( ! needChange ){
            favoriteMatchesAfterCheck.push(favoriteMatchedID[i]);
        }
    }

    if ( favoriteMatchesAfterCheck.length != 0 ){

        var favoriteMatches = await matches_domain.getMatchesInfo(favoriteMatchesAfterCheck);
        // favoriteMatches = favoriteMatches.sort( (a, b) => a.matchDate - b.matchDate);
        favoriteMatches = favoriteMatches.sort((a, b) =>  (('' + a.matchDate).localeCompare(b.matchDate)));

    } else{
        return [];
    }

    if (favoriteMatches.length > 3){
        return favoriteMatches.slice(0, 3);
    }
    return favoriteMatches;
    
}
exports.getFavoriteMatchesForMainPage = getFavoriteMatchesForMainPage;