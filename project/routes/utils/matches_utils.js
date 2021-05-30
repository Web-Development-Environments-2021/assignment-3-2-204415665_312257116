const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getMatchesInfo ------------------------------ *//

async function getMatchesInfo(match_ids_array) {
    let promises = [];
    match_ids_array.map((id) =>
      promises.push(
        axios.get(`${api_domain}/fixtures/${id}`, {
          params: {
            api_token: process.env.api_token,
            include:`localTeam, visitorTeam, venue, referee`,
          },
        })
      )
    ); 
    let matches_info = await Promise.all(promises);
    return extractRelevantMatchesData(matches_info);
  }

//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantMatchesData(matches_info) {
    return matches_info.map((curr_match_info) => {
      const { match_id } = curr_match_info.data.data;
      var homeTeamName = curr_match_info.data.data.localTeam.data["name"];
      var awayTeamName = curr_match_info.data.data.visitorTeam.data["name"];
      const { date_time } = curr_match_info.data.data.time.starting_at;
      var stadium = curr_match_info.data.data.venue.data["name"];
      if (curr_match_info.data.data.referee){
        const { firstname,lastname } = curr_match_info.data.data.referee.data;
        return {
          matchID: match_id,
          matchDate: date_time,
          localTeamName: homeTeamName,
          visitorTeamName: awayTeamName,
          venueName: stadium,
          
          refereeInformation: {
            "firstname": firstname,
            "lastname": lastname,
            course: "Regular"
          },
        };
      }
      return {
        matchID: match_id,
        matchDate: date_time,
        localTeamName: homeTeamName,
        visitorTeamName: awayTeamName,
        venueName: stadium,
      
      };
    });
  }
  
<<<<<<< HEAD
  exports.getMatchesInfo = getMatchesInfo;
=======



  
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
  
  var futureMatch = await DButils.execQuery(
    `select * from FutureMatches where match_id='${matchID}'`
  );

  var pastMatches = await DButils.execQuery(
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





>>>>>>> 6fd5826c1085faaeba2356e7af5333941f2c214a
