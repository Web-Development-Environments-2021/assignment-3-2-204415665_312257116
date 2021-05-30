const DButils = require("./DButils");


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
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', null, null, null, null)`
    );

  } else {
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', '${refereeID}', null, null, null)`
    );
  }
}
exports.addNewPastMatch = addNewPastMatch;



//* ------------------------------ Add Past Match Result------------------------------ *//

async function addFutureMatchResult(matchID, matchDate, localTeamName, visitorTeamName, venueName, refereeID, localTeamScore, visitorTeamScore) {
  
  if (refereeID == undefined){
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', null,'${localTeamScore}','${visitorTeamScore}', null )`
    );

  } else {
    await DButils.execQuery(
      `insert into PastMatches values ('${matchDate}','${localTeamName}','${visitorTeamName}','${venueName}', '${refereeID}','${localTeamScore}','${visitorTeamScore}', null )`
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