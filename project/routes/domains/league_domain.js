
const league_utils = require("../utils/league_utils");
const matches_utils = require("../utils/matches_utils");

const matches_domain = require("../domains/matches_domain");

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