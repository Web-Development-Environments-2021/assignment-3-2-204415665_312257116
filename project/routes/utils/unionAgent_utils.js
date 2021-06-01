const DButils = require("./DButils");
const matches_utils = require("./matches_utils");


//TODO: Need Make Authentication

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

  var hours = Math.floor(minuteInMatch/60);
  var minutes = minuteInMatch % 60;
  minuteInMatch = hours + ":" + minutes + ":00"

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


