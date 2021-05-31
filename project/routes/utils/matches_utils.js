const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const unionAgent_utils = require("./unionAgent_utils");


//* ------------------------------ getMatchesInfo ------------------------------ *//

async function getMatchesInfo(match_ids_array) {
  let promises = [];
  match_ids_array.map((match_id) =>
    promises.push(
      getMatchByID(match_id)
    )
  ); 
  let matches_info = await Promise.all(promises);

  return extractMatchesInfo(matches_info);
}
//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

async function extractMatchesInfo(matches_info) {

  return await Promise.all(matches_info.map(async (element) => {
    if (element[0].refereeID){
      var refereeInfo = await extractRefereeInfo(element[0].refereeID);
      return { 
          matchID: element[0].match_id,
          matchDate: element[0].matchDateAndTime,
          localTeamName: element[0].localTeamName,
          visitorTeamName: element[0].visitorTeamName,
          venueName: element[0].venueName,
          refereeInformation: refereeInfo[0]  
        };
      }
    else{
      return {
        matchID: element[0].match_id,
        matchDate: element[0].matchDateAndTime,
        localTeamName: element[0].localTeamName,
        visitorTeamName: element[0].visitorTeamName,
        venueName: element[0].venueName,
      };
    }
  })
  );
}
exports.getMatchesInfo = getMatchesInfo;



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

  return futureMatch;
}
exports.getPastMatchByID = getPastMatchByID;



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

async function extractEventLog(matchID){

  var eventsLog = [];
  var next = true;
  

  var event = await DButils.execQuery(
    `select * from MatchEvents where matchID='${matchID}'`
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
  if (event.length !=0){
    eventsLog.push(event);
  }

  return eventsLog;
}

exports.extractEventLog = extractEventLog;













