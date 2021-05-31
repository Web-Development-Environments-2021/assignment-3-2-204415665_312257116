const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getMatchsInfo ------------------------------ *//

async function getMatchsInfo(match_ids_array) {
    let promises = [];
    match_ids_array.map((id) =>
      promises.push(
        axios.get(`${api_domain}/fixtures/${id}`, {
          params: {
            api_token: process.env.api_token,
            include:`localTeam, visitorTeam, venue`,
          },
        })
      )
    ); 
    let matchs_info = await Promise.all(promises);
    return extractRelevantMatchsData(matchs_info);
  }

//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantMatchsData(matchs_info) {
    return matchs_info.map((curr_match_info) => {
      var homeTeamName = curr_match_info.data.data.localTeam.data["name"];
      var awayTeamName = curr_match_info.data.data.visitorTeam.data["name"];
      const { date_time } = curr_match_info.data.data.time.starting_at;
      var stadium = curr_match_info.data.data.venue.data["name"];
      return {
        matchDate: date_time,
        loaclTeamName: homeTeamName,
        visitorTeamName: awayTeamName,
        venueName: stadium,
      };
    });
  }
  
  exports.getMatchsInfo = getMatchsInfo;



  

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

async function getPastMatchByID(matchID) {

  var pastMatches = await DButils.execQuery(
    `select * from PastMatches where match_id='${matchID}'`
  );

  return pastMatches;
}
exports.getPastMatchByID = getPastMatchByID;


//* ------------------------------ Get Future Match By ID------------------------------ *//

async function getFutureMatchByID(matchID) {
  
  var futureMatch = await DButils.execQuery(
    `select * from FutureMatches where match_id='${matchID}'`
  );

  return futureMatch;
}
exports.getFutureMatchByID = getFutureMatchByID;


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













