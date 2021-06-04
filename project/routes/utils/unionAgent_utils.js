const DButils = require("./DButils");


//* ------------------------------ Add New Future Match ------------------------------ *//

async function addNewFutureMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID) {
  
  if (refereeID == undefined){
    await DButils.execQuery(
      `insert into FutureMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', null)`
    );

  } else {
    await DButils.execQuery(
      `insert into FutureMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', '${refereeID}')`
    );
  }
}
exports.addNewFutureMatch = addNewFutureMatch;


//* ------------------------------ Add New Past Match ------------------------------ *//

async function addNewPastMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID) {
  
  if (refereeID == undefined){
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', null, null, null)`
    );

  } else {
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', '${refereeID}', null, null)`
    );
  }
}
exports.addNewPastMatch = addNewPastMatch;


//* ------------------------------ Add Past Match Result------------------------------ *//

async function addFutureMatchResult(matchID, matchDate, localTeamName, visitorTeamName, venueName, refereeID, localTeamScore, visitorTeamScore) {
  
  if (refereeID == undefined){
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', null,'${localTeamScore}','${visitorTeamScore}')`
    );

  } else {
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', '${refereeID}','${localTeamScore}','${visitorTeamScore}')`
    );
  }

  await DButils.execQuery(
    `delete from FutureMatches where match_id='${matchID}'`
  );

}
exports.addFutureMatchResult = addFutureMatchResult;


//* ------------------------------ Add Future Match Result------------------------------ *//

async function addPastMatchResult(matchID, localTeamScore, visitorTeamScore) {
  
  await DButils.execQuery(
    `update PastMatches 
      set localTeamScore='${localTeamScore}', visitorTeamScore='${visitorTeamScore}' 
      where match_id='${matchID}'`
  );

}
exports.addPastMatchResult = addPastMatchResult;


//* ------------------------------ Add Event ------------------------------ *//

async function addEvent(matchID, eventTimeAndDate, minuteInMatch, eventType, eventDescription){

  await DButils.execQuery(
    `insert into MatchEvents values ('${matchID}', '${eventTimeAndDate}', '${minuteInMatch}', '${eventType}', '${eventDescription}')`
  );
  
}
exports.addEvent = addEvent;


//* ------------------------------ Get Referee By ID ------------------------------ *//

async function getRefereeByID(refereeID){


  return await DButils.execQuery(
    `Select * From Referee where referee_id='${refereeID}'`
  );
  
}
exports.getRefereeByID = getRefereeByID;


//* ------------------------------ Add Referee To Future Match ------------------------------ *//

async function addRefereeToFutureMatch(matchID, refereeID){


  await DButils.execQuery(
    `update FutureMatches set refereeID=${refereeID} where match_id='${matchID}'`
  );
  
}
exports.addRefereeToFutureMatch = addRefereeToFutureMatch;


//* ------------------------------ Add Referee To Past Match ------------------------------ *//

async function addRefereeToPastMatch(matchID, refereeID){


  await DButils.execQuery(
    `update PastMatches set refereeID=${refereeID} where match_id='${matchID}'`
  );
  
}
exports.addRefereeToPastMatch = addRefereeToPastMatch;

