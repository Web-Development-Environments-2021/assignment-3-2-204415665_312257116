const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getMatchesInfo ------------------------------ *//

async function getMatchesInfo(match_ids_array) {
  let promises = [];
  let n;
  match_ids_array.map((match_id) =>
    promises.push(
      getMatchByID(match_id)
    )
  ); 
  let matches_info = await Promise.all(promises);

  return extractMatchesInfo(matches_info);
}
//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractMatchesInfo(matches_info) {

  return matches_info.map((element) => {
    if (element[0].refereeID){
      return { 
          matchID: element[0].match_id,
          matchDate: element[0].matchDateAndTime,
          localTeamName: element[0].localTeamName,
          visitorTeamName: element[0].visitorTeamName,
          venueName: element[0].venueName,
          refereeInformation:  extractRefereeInfo(element[0].refereeID),
          
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

  });
}
exports.getMatchesInfo = getMatchesInfo;


  // await match_ids_array.map((curr_match) => {
  //   promises.push(
  //      getMatchByID(curr_match.match_id)
  //      )
  // });
  

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


//* ------------------------------ Get Match By ID------------------------------ *//

async function getMatchByID(matchID) {
  
  const futureMatch = await DButils.execQuery(
    `select * from FutureMatches where match_id='${matchID}'`
  );

  const pastMatches = await DButils.execQuery(
    `select * from PastMatches where match_id='${matchID}'`
  );
  
  if (futureMatch.length != 0){
    return futureMatch;
  } else{
    return pastMatches;
  }

}
exports.getMatchByID = getMatchByID;


//* ------------------------------ Extract Referee Information ------------------------------ *//

async function extractRefereeInfo(refereeID){

  if (refereeID == null){
    return {};
  } 
  const refereeInfo = await DButils.execQuery(
    `select firstname, lastname, course from Referee where referee_id='${refereeID}'`
  );

  // return refereeInfo.map((element) => {
    return {
      firstname : refereeInfo.firstname,
      lastname : refereeInfo.lastname,
      course : refereeInfo.course
    }
  // });
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







