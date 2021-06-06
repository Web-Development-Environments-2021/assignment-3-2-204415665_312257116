
const matches_domain = require("../domains/matches_domain")
const DButils = require("./DButils");
const users_utils = require("./users_utils");


//* ------------------------------ Get League Matches ------------------------------ *//

async function getLeagueMatches() {

  const futureMatches = await DButils.execQuery(
      `select * from FutureMatches`
    );

  const pastMatches = await DButils.execQuery(
    `select * from PastMatches`
  );

  return [pastMatches, futureMatches];
}
exports.getLeagueMatches = getLeagueMatches;


//* ------------------------------ Get Past Match By ID------------------------------ *//

async function getMatchByID(matchID) {
  
  const futureMatch = await DButils.execQuery(
    `select * from FutureMatches where match_id='${matchID}'`
  );
  if (futureMatch.length != 0){
    return futureMatch;
  }

  const pastMatches = await DButils.execQuery(
    `select * from PastMatches where match_id='${matchID}'`
  );
  
  return pastMatches;
}
exports.getMatchByID = getMatchByID;


//* ------------------------------ Get Future Match By ID------------------------------ *//

async function getFutureMatchByID(matchID) {
  
  var futureMatch = await DButils.execQuery(
    `select * from FutureMatches where match_id='${matchID}'`
  );

  return futureMatch;
}
exports.getFutureMatchByID = getFutureMatchByID;


//* ------------------------------ Get Past Match By ID------------------------------ *//

async function getPastMatchByID(matchID) {
  
  var pastMatch = await DButils.execQuery(
    `select * from PastMatches where match_id='${matchID}'`
  );

  return pastMatch;
}
exports.getPastMatchByID = getPastMatchByID;



//* ------------------------------ Extract Referee Information ------------------------------ *//

async function extractRefereeInfo(refereeID){

  if (refereeID == null){
    return {};
  } 
  const refereeInfo = await DButils.execQuery(
    `select * from Referee where referee_id='${refereeID}'`
  );
  return refereeInfo.map((element) => {
    return {
      refereeID : element.referee_id,
      firstname : element.firstname,
      lastname : element.lastname,
      course : element.course
    }
  });
}
exports.extractRefereeInfo = extractRefereeInfo;

//* ------------------------------ Extract Event Log ------------------------------ *//

async function extractEventLog(matchID){

  var eventsLog = [];
  var next = true;
  

  var event = await DButils.execQuery(
    `select * from MatchEvents where matchID='${matchID}'`
  );
  event = event.map((element) => {
    next = element.nextMatchEventID;
    return {
      eventID : element.eventID,
      eventTimeAndDate :  matches_domain.getDateTimeDisplayFormat(element.eventTimeAndDate),
      minuteInMatch : element.minuteInMatch,
      eventType : element.eventType,
      eventDescription : element.eventDescription
    }
  })
  if (event.length !=0){
    eventsLog.push(event);
  }

  return eventsLog;
}
exports.extractEventLog = extractEventLog;


//* ------------------------------ get Next First Match ------------------------------ *//

async function getFirstNextMatch() {

  const firstNextMatch = await DButils.execQuery(`select top 1 * from FutureMatches where matchDateAndTime > GETDATE() order by matchDateAndTime ASC`
  );
  return firstNextMatch;

}
exports.getFirstNextMatch = getFirstNextMatch;


//* ------------------------------ getFutureMatchByTeamsName ------------------------------ *//

async function getFutureMatchByTeamName(TeamName) {
  
  var futureMatch = await DButils.execQuery(
    `select * from FutureMatches where localTeamName='${TeamName}' or visitorTeamName='${TeamName}'`
  );

  return futureMatch;
}
exports.getFutureMatchByTeamName = getFutureMatchByTeamName;


//* ------------------------------ getPastMatchByTeamsName ------------------------------ *//

async function getPastMatchByTeamName(TeamName) {
  
  var pastMatch = await DButils.execQuery(
    `select * from PastMatches where localTeamName='${TeamName}' or visitorTeamName='${TeamName}'`
  );

  return pastMatch;

}
exports.getPastMatchByTeamName = getPastMatchByTeamName;


//* ------------------------------ Match From Future To Past ------------------------------ *//

async function matchFromFutureToPast(match_id){

  await DButils.execQuery(
    `INSERT INTO PastMatches ( matchDateAndTime, localTeamName, visitorTeamName, venueName, refereeID)
    SELECT  matchDateAndTime, localTeamName, visitorTeamName, venueName, refereeID
    FROM FutureMatches
    WHERE match_id=(${match_id});
    
    DELETE FROM FutureMatches
    WHERE match_id=(${match_id});`
  );

  await users_utils.removeFavoriteMatch(match_id);

}
exports.matchFromFutureToPast = matchFromFutureToPast;


//* ------------------------------ Delete Match By ID And Which------------------------------ *//

async function deleteMatchByIDAndWhich(match_id, whichMatch){

  if ( whichMatch == "future"){
    await DButils.execQuery(
      `delete from FutureMatches where match_id='${match_id}'`
    );
  } else if ( whichMatch == "past" ){
    await DButils.execQuery(
      `delete from PastMatches where match_id='${match_id}'`
    );
  }

  await users_utils.removeFavoriteMatch(match_id);

}
exports.deleteMatchByIDAndWhich = deleteMatchByIDAndWhich;


//* ------------------------------ Check If Match In DB ------------------------------ *//

async function checkIfMatchInDB(matchDate, localTeamName, visitorTeamName, venueName){

  var match = await DButils.execQuery(
    `select * from FutureMatches where 
    matchDateAndTime='${matchDate}' and localTeamName='${localTeamName}' and visitorTeamName='${visitorTeamName}' and venueName='${venueName}'`
  );
  if (match.length != 0){
    return true;
  }

  var match = await DButils.execQuery(
    `select * from PastMatches where 
    matchDateAndTime='${matchDate}' and localTeamName='${localTeamName}' and visitorTeamName='${visitorTeamName}' and venueName='${venueName}'`
  );
  if (match.length != 0){
    return true;
  }
  
  return false;

}
exports.checkIfMatchInDB = checkIfMatchInDB;