
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

    if ( refereeDic.length != undefined ){
      first_next_match[0]["refereeInformation"] = refereeDic[0];
    } else{
      first_next_match[0]["refereeInformation"] = {};
    }

    delete first_next_match[0]["refereeID"];
 
    return first_next_match[0];
    
}
exports.getNextLeagueMatch = getNextLeagueMatch;


//* ------------------------------ Get Favorite Matches For Main Page ------------------------------ *//
    
async function getFavoriteMatchesForMainPage(user_id){
  
    var favoriteMatchedID = await users_domain.getFavoriteMatches_domain(user_id);

    var favoriteMatchesAfterCheck = [];

    favoriteMatchesAfterCheck = await matches_domain.checkFavoriteMatches(favoriteMatchedID);

    if ( favoriteMatchesAfterCheck.length != 0 ){

        var favoriteMatches = await matches_domain.getMatchesInfo(favoriteMatchesAfterCheck);
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


    const Qsearch = await league_utils.getQueryInfo(Search_Query, Search_Type);
    let resultQ;
    if(Search_Type=="All"){
      return {all_Info: Qsearch};
    }
  
  //-------------------------------------- Teams --------------------------------------//
    if(Search_Type=="Teams" ){
  
      if(Sort_Teams_Alphabetical=="yes"){
        //Sort the teams in alphabetical order by teamName
        Qsearch.sort((a, b) => 
        (('' + a["teamName"]).localeCompare(b["teamName"])));
      }
      resultQ = Qsearch;    
      return {teams: Qsearch};
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
      else{
        resultQ = Qsearch;
      }
      
    }
    return {players:resultQ};
}
exports.SQL_searchByQuery = SQL_searchByQuery;
