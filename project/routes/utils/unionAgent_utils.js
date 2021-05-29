const DButils = require("./DButils");



//* ------------------------------ Add New Match ------------------------------ *//

async function addNewMatch(matchDate, loaclTeamName, visitorTeamName, venueName, refereeID) {
  
  if (refereeID == undefined){
    await DButils.execQuery(
      `insert into FutureMatches values ('${matchDate}','${loaclTeamName}','${visitorTeamName}','${venueName}', null)`
    );

  } else {
    await DButils.execQuery(
      `insert into FutureMatches values ('${matchDate}','${loaclTeamName}','${visitorTeamName}','${venueName}', '${refereeID}')`
    );
  }
}
exports.addNewMatch = addNewMatch;


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


//* ------------------------------ Extract Referee Information ------------------------------ *//

async function extractRefereeInfo(refereeID){

  if (refereeID == null){
    return {};
  } 
  const refereeInfo = await DButils.execQuery(
    `select firstname, lastname, course from Referee where referee_id='${refereeID}'`
  );

  return refereeInfo.map((element) => {
    return {
      firstname : element.firstname,
      lastname : element.lastname,
      course : element.course
    }
  });
}

exports.extractRefereeInfo = extractRefereeInfo;

//* ------------------------------ Extract Event Log ------------------------------ *//

async function extractEventLog(EventID){

  if (EventID == null){
    return [];
  }
  var eventsLog = [];
  var next = true;
  
  while(next){
    var event = await DButils.execQuery(
      `select * from MatchEvents where eventID='${EventID}'`
    );
    event = event.map((element) => {
      next = element.nextMatchEventID;
      return {
        eventTimeAndDate : element.eventTimeAndDate,
        minuteInMatch : element.minuteInMatch,
        eventType : element.eventType,
        eventDescription : element.eventDescription
      }
    })

    if (next == null){
      next = false;
    } else{
      EventID = next;
      next = true;
    }
    eventsLog.push(event);
  }

  return eventsLog;
}

exports.extractEventLog = extractEventLog;

