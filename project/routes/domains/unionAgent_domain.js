
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
      var matchDateAndTime = matches_domain.getDateTimeDisplayFormat(element.matchDateAndTime);
      matchesWithResult.push({
        matchID : element.match_id,
        matchDateAndTime : matchDateAndTime,
        localTeamName : element.localTeamName,
        visitorTeamName : element.visitorTeamName,
        venueName : element.venueName,
        refereeID : element.refereeID,
        localTeamScore : element.localTeamScore,
        visitorTeamScore : element.visitorTeamScore
      });
    };
  });

  for ( var i=0 ; i < matchesWithResult.length ; i++ ){

    var refereeDic = await matches_utils.extractRefereeInfo(matchesWithResult[i]["refereeID"]);

    if ( refereeDic.length != undefined ){
      matchesWithResult[i]["refereeInformation"] = refereeDic[0];
    } else{
      matchesWithResult[i]["refereeInformation"] = {};
    }
    delete matchesWithResult[i].refereeID;
  }


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
      var matchDate = matches_domain.getDateTimeDisplayFormat(element.matchDateAndTime);
      matchesWithReferee[0].push({
        matchID : element.match_id,
        matchDate : matchDate,
        localTeamName : element.localTeamName,
        visitorTeamName : element.visitorTeamName,
        venueName : element.venueName
      });
    };
  });

  matches[1].map((element) => {
    if(element.refereeID == null){
      var matchDateAndTime = matches_domain.getDateTimeDisplayFormat(element.matchDateAndTime);
      matchesWithReferee[1].push({
        matchID : element.match_id,
        matchDateAndTime : matchDateAndTime,
        localTeamName : element.localTeamName,
        visitorTeamName : element.visitorTeamName,
        venueName : element.venueName,
        localTeamScore : element.localTeamScore,
        visitorTeamScore : element.visitorTeamScore
      });
    };
  });

  return matchesWithReferee;
    
}
exports.GetAllMatchesWithoutReferee = GetAllMatchesWithoutReferee;


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
    
async function checkInputForAddMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID){
  
  var badRequest = false;
  var message = "";

  var resultFromUtils = await league_utils.checkTeamNames(localTeamName, visitorTeamName);

  badRequest = resultFromUtils.badRequest;
  message = resultFromUtils.message;

  if ( ! (/^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/).test(matchDate) ){
    badRequest = true;
    message += " match's date not in the right format,";
  } 
  var parsedDate = Date.parse(matchDate);
  if ( ! badRequest && isNaN(parsedDate) ){
    badRequest = true;
    message += " match's date not in the right format,";
  }

  if ( localTeamName == visitorTeamName ){
    badRequest = true;
    message += " visitor and local teams are the same,"
  }

  if(! await league_utils.checkVenueName(venueName)){
    badRequest = true;
    message += "  venue doesn't exist,"
  } 
  if(refereeID != undefined){

    if (Number.isInteger(refereeID)){

      var referee = (await unionAgent_utils.getRefereeByID(refereeID));
      if (referee.length == 0){
        badRequest = true;
        message += "  referee doesn't exist,"
      }

    } else{
      badRequest = true;
      message += " refereeID is no int,"
    }
    
  }

  return {badRequest : badRequest, message : message};
  
}
exports.checkInputForAddMatch = checkInputForAddMatch;


//* ------------------------------ Check If Match Exist ------------------------------ *//
    
async function checkIfMatchExist(matchDate, localTeamName, visitorTeamName, venueName){
  
  var badRequest = false;
  var message = "";

  var resultFromUtils = await matches_utils.checkIfMatchInDB(matchDate, localTeamName, visitorTeamName, venueName);

  if ( resultFromUtils ){
    badRequest = true;
    message = "match already exist,";
  }
  

  return {badRequest : badRequest, message : message};
  
}
exports.checkIfMatchExist = checkIfMatchExist;


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


//* ------------------------------ Check Input For Delete Match ------------------------------ *//
    
async function checkInputForDeleteMatch(matchID){
     
  var badRequest = false;
  var message = "";

  if ( Number.isInteger(matchID) && matchID >= 1){
    
    var match = await matches_utils.getMatchByID(matchID);

    if ( match.length == 0 ){
      badRequest = true;
      message = "Match not found";
    }

  } else{
    badRequest = true;
    message = " match ID in not int,";
  }

  return { badRequest : badRequest, message : message };

}
exports.checkInputForDeleteMatch = checkInputForDeleteMatch;


//* ------------------------------ DeleteMatch ------------------------------ *//
    
async function deleteMatch(matchID){
     
  var resultFromWhichMatch = await checkIfPastOrFuture(matchID);

  var match = resultFromWhichMatch.match;
  var whichMatch = resultFromWhichMatch.whichMatch;

  if (match.length != 0 ){
    await matches_utils.deleteMatchByIDAndWhich(matchID, whichMatch);
  }
  

}
exports.deleteMatch = deleteMatch;


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

  if ( localTeamScore < 0 || !Number.isInteger(localTeamScore) ){
    badRequest = true;
    message += " local team score,";
  }
  if ( visitorTeamScore < 0 || !Number.isInteger(visitorTeamScore) ){
    badRequest = true;
    message += " visitor team score,";
  }

  if (!Number.isInteger(matchID)) {
    badRequest = true;
    message += " match ID not int,";

  } else if (Number.isInteger(matchID)){
    
    var match = await matches_utils.getMatchByID(matchID);
    if (match.length == 0){
      badRequest = true;
      message += " match doesn't exist,";
    }
  }

  return {badRequest : badRequest, message : message};

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

  return { match : match , whichMatch : whichMatch };

}
exports.checkIfPastOrFuture = checkIfPastOrFuture;


//* ------------------------------ Insert Future Match Result ------------------------------ *//
    
async function InsertFutureMatchResult(match, matchID, localTeamScore, visitorTeamScore){
  
  var badRequest = false;
  var message = "";

  var dateTime = matches_domain.getTodayDateTime();
  if (Date.parse(dateTime) < Date.parse(match[0]["matchDateAndTime"])){
    badRequest = true;
    message += " future match date ,";

  } else {
    
    var matchDate = match[0].matchDateAndTime;
    var localTeamName = match[0].localTeamName;
    var visitorTeamName = match[0].visitorTeamName;
    var venueName = match[0].venueName;
    var refereeID = match[0].refereeID;
    matchDate = matches_domain.getDateTimeDisplayFormat(matchDate);

    await unionAgent_utils.addFutureMatchResult(matchID, matchDate, localTeamName, visitorTeamName, venueName, refereeID, localTeamScore, visitorTeamScore)
  }

  return {badRequest : badRequest, message : message};
  
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

  return {badRequest : badRequest, message : message};
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

  if ( !Number.isInteger(matchID) ){
    badRequest = true;
    message += "matchID not int,";
  }
  
  if ( badRequest ){
    return { badRequest : badRequest, message : message };
  }

  const match = await matches_utils.getPastMatchByID(matchID);

  if (match.length != 0){
    
    for (var i = 0 ; i < eventsLog.length ; i++){


      if ( !Number.isInteger(eventsLog[i]["minuteInMatch"]) ){
        badRequest = true;
        message = message + " error in event " + (i+1) + " -";
        message += " minute in match not int,";
      }

      if ( !badRequest && ( eventsLog[i]["minuteInMatch"] < 0 || eventsLog[i]["minuteInMatch"] > 130 )){
        message = message + " error in event " + (i+1) + " -";
        badRequest = true;
        message += " minute in match not in the range of 0-130,"
      }

      if (! matches_domain.checkEventType(eventsLog[i]["eventType"])){
        message = message + " error in event " + (i+1) + " -";
        badRequest = true;
        message += " wrong event type";
      }
      if (badRequest){
        break;
      }

      var eventTimeAndDate = calculateEventDateTime( match[0].matchDateAndTime, eventsLog[i].minuteInMatch );

      var minuteInMatch = eventsLog[i]["minuteInMatch"];
      var eventType = eventsLog[i]["eventType"];
      var eventDescription = eventsLog[i]["eventDescription"];
      if (eventDescription == undefined){
        eventDescription = 'null';
      }

      if ( await unionAgent_utils.checkIfEventExistByData( matchID, eventTimeAndDate, minuteInMatch, eventType ) ){
        badRequest = true;
        message += " event already exist,";
      } else {
        
        await unionAgent_utils.addEvent(matchID, eventTimeAndDate, minuteInMatch, eventType, eventDescription);
        
      }

    }
  } else{
    badRequest = true;
    message += " match doesn't exist";
  }

  return { badRequest : badRequest, message : message };

}
exports.InsertMatchEventLog = InsertMatchEventLog;


//* ------------------------------ Calculate Event Date Time ------------------------------ *//

function calculateEventDateTime(matchDateAndTime, minuteInMatch){

  var eventDateTime = new Date(matchDateAndTime);

  eventDateTime = eventDateTime.setTime(eventDateTime.getTime() + (minuteInMatch*60*1000));

  eventDateTime = matches_domain.getDateTimeDisplayFormat(eventDateTime);

  return eventDateTime;

    
}
exports.calculateEventDateTime = calculateEventDateTime;


//* ------------------------------ remove Match Event  ------------------------------ *//
    
async function removeMatch(matchID, eventID){
    
  var badRequest = false;
  var message = "";

  if ( ! Number.isInteger(matchID) ){
    badRequest = true;
    message += "matchID not int,";
  }

  if ( ! Number.isInteger(eventID) ){
    badRequest = true;
    message += "eventID not int,";
  }

  if ( badRequest ){
    return { badRequest : badRequest, message : message };
  }
  const match = await matches_utils.getPastMatchByID(matchID);

  if (match.length != 0){

    var resultFromUtils = await unionAgent_utils.removeEvent(matchID, eventID);

    if ( ! resultFromUtils ){
      badRequest = true;
      message += "match event doesn't exist"
    }
    
  } else{
    badRequest = true;
    message += " match doesn't exist";
  }

  return { badRequest : badRequest, message : message };

}
exports.removeMatch = removeMatch;


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
    message += " match ID in not int,"
  } 
  if ( !Number.isInteger(refereeID)){
    badRequest = true;
    message += " referee ID is not int,";
  }

  return { badRequest : badRequest, message : message };

}
exports.checkInputForAddReferee = checkInputForAddReferee;


//* ------------------------------ Get Match For Add Referee ------------------------------ *//
    
async function getMatchForAddReferee(matchID){
     
  var futureMatch = await matches_utils.getFutureMatchByID(matchID);
  var pastMatch = await matches_utils.getPastMatchByID(matchID);

  return { futureMatch : futureMatch, pastMatch : pastMatch };

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

  return { badRequest : badRequest, message : message };

}
exports.InsertRefereeToMatch = InsertRefereeToMatch;


//* ------------------------------ Insert Referee To Match ------------------------------ *//
    
async function updateRefereeInMatch(matchID, refereeID, futureMatch, pastMatch){
    
  var badRequest = false;
  var message = "";

  var refereeInfo = await unionAgent_utils.getRefereeByID(refereeID);

  if ( refereeInfo.length != 0 ){

    if (futureMatch.length != 0 && futureMatch[0]["refereeID"] != null){

      await unionAgent_utils.addRefereeToFutureMatch(matchID, refereeID);

    } else if (pastMatch.length != 0 && pastMatch[0]["refereeID"] != null ){

      await unionAgent_utils.addRefereeToPastMatch(matchID, refereeID);

    } else {

      badRequest = true;
      message += " doesn't have referee to change,";
    }

  } else{
    badRequest = true;
    message += " referee doesn't exist";
  }

  return { badRequest : badRequest, message : message };

}
exports.updateRefereeInMatch = updateRefereeInMatch;