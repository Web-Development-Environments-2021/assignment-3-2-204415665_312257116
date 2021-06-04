
const unionAgent_utils = require("../utils/unionAgent_utils");
const matches_utils = require("../utils/matches_utils");
const league_utils = require("../utils/league_utils");
const DButils = require("../utils/DButils");

const matches_domain = require("../domains/matches_domain");


//* ------------------------------ Get Past Matches Without Result ------------------------------ *//


async function GetPastMatchesWithoutResult(){

  var matches = await matches_utils.getLeagueMatches();
  var matchesWithResult = [];

  matches[0].map((element) => {
    if(element.visitorTeamScore == null || element.localTeamScore == null){
      matchesWithResult.push(element);
    };
  });


  return matchesWithResult;
    
}
exports.GetPastMatchesWithoutResult = GetPastMatchesWithoutResult;

  
//* ------------------------------ Get All Referees ------------------------------ *//

async function getAllReferees(){

  var referees = await DButils.execQuery(
    `select * from Referee`
  );

  return referees.map((element) => {
    return {
      refereeID : element.referee_id,
      firstname : element.firstname,
      lastname : element.lastname,
      course : element.course
    }
  });
  
    
}
exports.getAllReferees = getAllReferees;
  

//* ------------------------------ Get All Matches Without Referee ------------------------------ *//
  
async function GetAllMatchesWithoutReferee(){
  
    
  var matches = await matches_utils.getLeagueMatches();
  var matchesWithReferee = [[],[]];

  matches[0].map((element) => {
    if(element.refereeID == null){
      matchesWithReferee[0].push(element);
    };
  });

  matches[1].map((element) => {
    if(element.refereeID == null){
      matchesWithReferee[1].push(element);
    };
  });

  return matchesWithReferee;
    
}
exports.GetAllMatchesWithoutReferee = GetAllMatchesWithoutReferee;
  
  
//* ------------------------------ Get Past Matches Without Result ------------------------------ *//
    
async function GetPastMatchesWithoutResult(){
    
  var matches = await matches_utils.getLeagueMatches();
  var matchesWithResult = [];

  matches[0].map((element) => {
    if(element.visitorTeamScore == null || element.localTeamScore == null){
      matchesWithResult.push(element);
    };
  });


  return matchesWithResult;
    
}
exports.GetPastMatchesWithoutResult = GetPastMatchesWithoutResult;


//* ------------------------------ Get All Data For Add Match ------------------------------ *//
    
async function getAllDataForAddMatch(){
  
    
  const teamsNames = await league_utils.getTeamsNames();
  const venuesNames = await league_utils.getVenuesNames();
  const referees = await getAllReferees();

  const dataForUnionAgent = {
    teamsNames : teamsNames,
    venuesName : venuesNames,
    referees : referees 
  }


  return dataForUnionAgent;
  
}
exports.getAllDataForAddMatch = getAllDataForAddMatch;

//* ------------------------------ Check Input For Add Match ------------------------------ *//
    
async function checkInputForAddMatch(localTeamName, visitorTeamName, venueName, refereeID){
  
  var badRequest = false;
  var message = "";
    
  if (! await league_utils.checkTeamNames(localTeamName, visitorTeamName)){
    badRequest = true;
    message = " teams names,";
  } 
  if(! await league_utils.checkVenueName(venueName)){
    badRequest = true;
    message += "  venue name,"
  } 
  if(refereeID != undefined){
    var referee = (await unionAgent_utils.getRefereeByID(refereeID));
    if (referee.length == 0){
      badRequest = true;
      message += "  referee ID"
    }
  }

  if (badRequest){
    return true, message;

  } 
  else{
    return false, "";
  }
  
}
exports.checkInputForAddMatch = checkInputForAddMatch;


//* ------------------------------ Insert New Match ------------------------------ *//
    
async function InsertNewMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID){
  
  var dateTime =  matches_domain.getTodayDateTime();

  if (Date.parse(dateTime) < Date.parse(matchDate)){
    await unionAgent_utils.addNewFutureMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
  } else{
    await unionAgent_utils.addNewPastMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
  }
  
}
exports.InsertNewMatch = InsertNewMatch;


//* ------------------------------ Get Past Matches To Add Result ------------------------------ *//
    
async function getPastMatchesToAddResult(){
  
    
  const pastMatchesWithoutResult = await GetPastMatchesWithoutResult();

  const resultResponse = {
    pastMatchesWithoutResult : pastMatchesWithoutResult
  }

  return resultResponse;
  
}
exports.getPastMatchesToAddResult = getPastMatchesToAddResult;


//* ------------------------------ Check Input For Add Result ------------------------------ *//
    
async function checkInputForAddResult(matchID, localTeamScore, visitorTeamScore){
     
  var badRequest = false;
  var message = "";

  if (visitorTeamScore < 0 || localTeamScore < 0 ||
      !Number.isInteger(localTeamScore) || 
      !Number.isInteger(visitorTeamScore)){
    badRequest = true;
    message += " scores,";
  }

  if (!Number.isInteger(matchID)) {
    badRequest = true;
    message += " match ID,";
  } else if (Number.isInteger(matchID)){
    
    var match = await matches_utils.getMatchByID(matchID);
    if (match.length == 0){
      badRequest = true;
      message += " match doesn't exist,";
    }
  }

  if (badRequest){
    return true, message;
  }
  else{
    return false, "";
  }

}
exports.checkInputForAddResult = checkInputForAddResult;


//* ------------------------------ Check If Past Or Future ------------------------------ *//
    
async function checkIfPastOrFuture(matchID){
     
  var match = await matches_utils.getPastMatchByID(matchID);
  var whichMatch = "past";

  if (match.length == 0){
    match = await matches_utils.getFutureMatchByID(matchID);
    whichMatch = "future";
  }

  return match, whichMatch;

}
exports.checkIfPastOrFuture = checkIfPastOrFuture;


//* ------------------------------ Insert Future Match Result ------------------------------ *//
    
async function InsertFutureMatchResult(match, matchID, localTeamScore, visitorTeamScore){
  
  var badRequest = false;
  var message = "";

  var dateTime = matches_domain.getTodayDateTime();
  if (Date.parse(dateTime) < Date.parse(match[0]["matchDateAndTime"])){
    badRequest = true;
    message += " Date Time,";

  } else {
    
    var matchDate = match[0].matchDateAndTime;
    var localTeamName = match[0].localTeamName;
    var visitorTeamName = match[0].visitorTeamName;
    var venueName = match[0].venueName;
    var refereeID = match[0].refereeID;
    matchDate = matches_domain.getDateTimeDisplayFormat(matchDate);

    await unionAgent_utils.addFutureMatchResult(matchID, matchDate, localTeamName, visitorTeamName, venueName, refereeID, localTeamScore, visitorTeamScore)
  }

  if (badRequest){
    return true, message;
  }
  else{
    return false, "";
  }
  
}
exports.InsertFutureMatchResult = InsertFutureMatchResult;


//* ------------------------------ Insert Past Match Result ------------------------------ *//
    
async function InsertPastMatchResult(match, matchID, localTeamScore, visitorTeamScore){
    
  var badRequest = false;
  var message = "";

  var localTeamScore_DB = match[0]["localTeamScore"];
  var visitorTeamScore_DB = match[0]["visitorTeamScore"];

  if (localTeamScore_DB != null && visitorTeamScore_DB != null){
    badRequest = true;
    message += " match already has score";

  } else {
    await unionAgent_utils.addPastMatchResult(matchID, localTeamScore, visitorTeamScore);
  }

  if (badRequest){
    return true, message;
  }
  else{
    return false, "";
  }
}
exports.InsertPastMatchResult = InsertPastMatchResult;


//* ------------------------------ Get Past Matches To Add Event Log ------------------------------ *//
    
async function getPastMatchesToAddEventLog(){
  
  const leagueMatches = await matches_utils.getLeagueMatches();

  const pastMatchesWithAllInfo = await matches_domain.addRefereeToPastMatches(leagueMatches[0]);

  const resultResponse = {
    pastMatchesWithAllInfo : pastMatchesWithAllInfo
  }

  return resultResponse;
  
}
exports.getPastMatchesToAddEventLog = getPastMatchesToAddEventLog;


//* ------------------------------ Insert Match Event Log ------------------------------ *//
    
async function InsertMatchEventLog(matchID, eventsLog){
    
  var badRequest = false;
  var message = "";

  const match = await matches_utils.getPastMatchByID(matchID);
  var dateTime = matches_domain.getTodayDateTime();

  if (match.length != 0){
    
    for (var i = 0 ; i < eventsLog.length ; i++){

      if (Date.parse(eventsLog[i]["eventTimeAndDate"]) >= Date.parse(dateTime)){
        badRequest = true;
        message += " date time,";
      }
      if (!Number.isInteger(eventsLog[i]["minuteInMatch"]) || eventsLog[i]["minuteInMatch"] < 0 || eventsLog[i]["minuteInMatch"] > 130){
        badRequest = true;
        message += " minute in match,"
      }
      if (! matches_domain.checkEventType(eventsLog[i]["eventType"])){
        badRequest = true;
        message += " event type";
      }
      if (badRequest){
        break;
      }

      var eventTimeAndDate = matches_domain.getDateTimeDisplayFormat(eventsLog[i]["eventTimeAndDate"]);
      var minuteInMatch = eventsLog[i]["minuteInMatch"];
      var eventType = eventsLog[i]["eventType"];
      var eventDescription = eventsLog[i]["eventDescription"];
      if (eventDescription == undefined){
        eventDescription = 'null';
      }

      await unionAgent_utils.addEvent(matchID, eventTimeAndDate, minuteInMatch, eventType, eventDescription);
    }
  } else{
    badRequest = true;
    message += " match doesn't exist";
  }

  if (badRequest){
    return true, message;
  }
  else{
    return false, "";
  }

}
exports.InsertMatchEventLog = InsertMatchEventLog;


//* ------------------------------ Get Past Matches To Add Referee ------------------------------ *//
    
async function getPastMatchesToAddReferee(){
  
  const referees = await getAllReferees();
  const matchesWithoutReferee = await GetAllMatchesWithoutReferee();

  const dataForUnionAgent = {
    referees : referees,
    futureMatchesWithoutReferee : matchesWithoutReferee[1],
    pastMatchesWithReferees : matchesWithoutReferee[0]
  }

  return dataForUnionAgent;
  
}
exports.getPastMatchesToAddReferee = getPastMatchesToAddReferee;



//* ------------------------------ Check Input For Add Referee ------------------------------ *//
    
async function checkInputForAddReferee(matchID, refereeID){
     
  var badRequest = false;
  var message = "";

  if ( !Number.isInteger(matchID)){
    badRequest = true;
    message += " match ID,"
  } 
  if ( !Number.isInteger(refereeID)){
    badRequest = true;
    message += " referee ID,";
  }

  if (badRequest){
    return true, message;
  }
  else{
    return false, "";
  }  

}
exports.checkInputForAddReferee = checkInputForAddReferee;


//* ------------------------------ Get Match For Add Referee ------------------------------ *//
    
async function getMatchForAddReferee(matchID){
     
  var futureMatch = await matches_utils.getFutureMatchByID(matchID);
  var pastMatch = await matches_utils.getPastMatchByID(matchID);

  return futureMatch, pastMatch;

}
exports.getMatchForAddReferee = getMatchForAddReferee;


//* ------------------------------ Insert Referee To Match ------------------------------ *//
    
async function InsertRefereeToMatch(matchID, refereeID, futureMatch, pastMatch){
    
  var badRequest = false;
  var message = "";

  var refereeInfo = await unionAgent_utils.getRefereeByID(refereeID);

  if ( refereeInfo.length != 0 ){

    if (futureMatch.length != 0 && futureMatch[0]["refereeID"] == null){

      await unionAgent_utils.addRefereeToFutureMatch(matchID, refereeID);

    } else if (pastMatch.length != 0 && pastMatch[0]["refereeID"] == null){

      await unionAgent_utils.addRefereeToPastMatch(matchID, refereeID);

    } else {

      badRequest = true;
      message += " already has referee";
    }

  } else{
    badRequest = true;
    message += " referee doesn't exist";
  }

  if (badRequest){
    return true, message;
  }
  else{
    return false, "";
  }

}
exports.InsertRefereeToMatch = InsertRefereeToMatch;