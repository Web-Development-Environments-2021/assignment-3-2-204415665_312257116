
const matches_utils = require("../utils/matches_utils");



//* ------------------------------ Get Today DataTime ------------------------------ *//

function getTodayDateTime(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}
exports.getTodayDateTime = getTodayDateTime;


//* ------------------------------ Get DataTime ------------------------------ *//
  
function getDateTimeDisplayFormat(dateTime){

  var dateTime = new Date(dateTime).toISOString().slice(0, 19).replace('T', ' ');

  return dateTime;
  
}
exports.getDateTimeDisplayFormat = getDateTimeDisplayFormat;


//* ------------------------------ Get Matches To League Management Page ------------------------------ *//

async function getMatchesToLeagueManagementPage(sortBy){

  const leagueMatches = await matches_utils.getLeagueMatches();

  const futureMatchesWithReferees = await SortMatchesBy(await addRefereeToFutureMatches(leagueMatches[1]), sortBy, "future");
  const pastMatchesWithReferees = await SortMatchesBy(await addRefereeToPastMatches(leagueMatches[0]), sortBy, "past");

  return { futureMatchesWithReferees : futureMatchesWithReferees, pastMatchesWithReferees : pastMatchesWithReferees };

}
exports.getMatchesToLeagueManagementPage = getMatchesToLeagueManagementPage;


//* ------------------------------ Get Matches To Current Stage ------------------------------ *//

async function getMatchesToCurrentStage(){

  const leagueMatches = await matches_utils.getLeagueMatches();

  var futureMatches = await SortMatchesBy(await addRefereeToFutureMatches(leagueMatches[1]), "Date", "future");
  var pastMatches = await SortMatchesBy(await addRefereeToPastMatches(leagueMatches[0]), "Date", "past");

  // pastMatches = pastMatches.filter(function (match) { return match.eventsLog.length >= 3 } );

  return { futureMatches : futureMatches, pastMatches : pastMatches };

}
exports.getMatchesToCurrentStage = getMatchesToCurrentStage;

//* ------------------------------ Add Referee To Future Matches ------------------------------ *//
  
async function addRefereeToFutureMatches(matchesToAdd){
  
    var matchesWithReferee = [];
    matchesToAdd.map((element) => matchesWithReferee.push(
       {
        matchID : element.match_id,
        matchDate : getDateTimeDisplayFormat(element.matchDateAndTime),
        localTeamName : element.localTeamName,
        visitorTeamName : element.visitorTeamName,
        venueName : element.venueName,
        refereeID : element.refereeID
      }
    ));
  
    for (var i = 0 ; i < matchesWithReferee.length ; i++){
  
      var refereeDic = await matches_utils.extractRefereeInfo(matchesWithReferee[i]["refereeID"]);

      if ( refereeDic.length != undefined ){
        matchesWithReferee[i]["refereeInformation"] = refereeDic[0];
      } else{
        matchesWithReferee[i]["refereeInformation"] = {};
      }
      delete matchesWithReferee[i]["refereeID"]
    }
    return matchesWithReferee;
}
exports.addRefereeToFutureMatches = addRefereeToFutureMatches;

  
//* ------------------------------ Add Referee To Past Matches ------------------------------ *//
  
async function addRefereeToPastMatches(matchesToAdd){
  
  var matchesWithReferee = [];
  matchesToAdd.map((element) => matchesWithReferee.push(
      {
      matchID : element.match_id,
      matchDate : getDateTimeDisplayFormat(element.matchDateAndTime),
      localTeamName : element.localTeamName,
      visitorTeamName : element.visitorTeamName,
      venueName : element.venueName,
      refereeID : element.refereeID,
      localTeamScore : element.localTeamScore,
      visitorTeamScore : element.visitorTeamScore
    }
  ));
  for (var i = 0 ; i < matchesWithReferee.length ; i++){

    var refereeDic = await matches_utils.extractRefereeInfo(matchesWithReferee[i]["refereeID"]);

    if ( refereeDic.length != undefined ){
      matchesWithReferee[i]["refereeInformation"] = refereeDic[0];
    } else{
      matchesWithReferee[i]["refereeInformation"] = {};
    }
    delete matchesWithReferee[i]["refereeID"]

    var eventDic = await matches_utils.extractEventLog(matchesWithReferee[i]["matchID"]);
    if (eventDic.length != 0 ){
      matchesWithReferee[i]["eventsLog"] = await SortMatchesEventsByMinute(eventDic[0]);
    } else{
      matchesWithReferee[i]["eventsLog"] = eventDic;
    }
    
  }
  return matchesWithReferee;
}
exports.addRefereeToPastMatches = addRefereeToPastMatches;
  

//* ------------------------------ Sort Match Events By Minute ------------------------------ *//
  
async function SortMatchesEventsByMinute(eventDic){
  
  var SortedEventDic= eventDic.sort((a, b) => a.minuteInMatch - b.minuteInMatch);
    
  
  return SortedEventDic;
}
exports.SortMatchesEventsByMinute = SortMatchesEventsByMinute;


//* ------------------------------ Sort Matches By Date ------------------------------ *//
  
async function SortMatchesBy(matchesToAdd, sortBy, futureOrPast){
  
  if (sortBy == "Date"){
    if (futureOrPast == "future"){
      var SortedMatches = matchesToAdd.sort((a, b) =>  (('' + a.matchDate).localeCompare(b.matchDate)));
    } else{
      var SortedMatches = matchesToAdd.sort((a, b) =>  (('' + a.matchDate).localeCompare(b.matchDate)));
    }
  } else if (sortBy != undefined){
    var SortedMatches = matchesToAdd.sort((a, b) => 
                        (a["localTeamName"] == sortBy == b["localTeamName"]) ? 0 :
                        (a["visitorTeamName"] == sortBy == b["visitorTeamName"]) ? 0 :
                        (a["visitorTeamName"] == sortBy) ? -1 :
                        (a["localTeamName"] == sortBy) ? -1 : 
                        (b["localTeamName"] == sortBy) ? 1 :
                        (b["visitorTeamName"] == sortBy) ? 1 : 0);
  } else{
    return matchesToAdd;
  }
  
  return SortedMatches;
}
exports.SortMatchesBy = SortMatchesBy;


//* ------------------------------ Check EventType ------------------------------ *//
  
function checkEventType(eventType){
  var types = ['Goal', 'Red card', 'Yellow card', 'Injury', 'Subsitute'];
  if (types.includes(eventType)){
    return true;
  }
  return false;
} 
exports.checkEventType = checkEventType;


//* ------------------------------ extractMatches_with_refereeInfo ------------------------------ *//

async function extractMatches_with_refereeInfo(matches_info) {

  return await Promise.all(matches_info.map(async (element) => {
    if (element.refereeID){
      var refereeInfo = await matches_utils.extractRefereeInfo(element.refereeID);
      return { 
          matchID: element.match_id,
          matchDate: getDateTimeDisplayFormat(element.matchDateAndTime),
          localTeamName: element.localTeamName,
          visitorTeamName: element.visitorTeamName,
          venueName: element.venueName,
          refereeInformation: refereeInfo 
        };
      }
    else{
      return {
        matchID: element.match_id,
        matchDate: getDateTimeDisplayFormat(element.matchDateAndTime),
        localTeamName: element.localTeamName,
        visitorTeamName: element.visitorTeamName,
        venueName: element.venueName,
      };
    }
  })
  );
}
exports.extractMatches_with_refereeInfo = extractMatches_with_refereeInfo;


//* ------------------------------ getMatchesInfo ------------------------------ *//

async function getMatchesInfo(match_ids_array) {
    let promises = [];
    match_ids_array.map((match_id) =>
      promises.push(
        matches_utils.getFutureMatchByID(match_id)
      )
    ); 
    let matches_info = await Promise.all(promises);
  
    return extractMatchesInfo(matches_info);
}
exports.getMatchesInfo = getMatchesInfo;


//* ---------------------------- extractRelevantPlayerData ---------------------------- *//
  
async function extractMatchesInfo(matches_info) {
  
    return await Promise.all(matches_info.map(async (element) => {
      if (element[0].refereeID){
        var refereeInfo = await matches_utils.extractRefereeInfo(element[0].refereeID);
        return { 
            matchID: element[0].match_id,
            matchDate: getDateTimeDisplayFormat(element[0].matchDateAndTime),
            localTeamName: element[0].localTeamName,
            visitorTeamName: element[0].visitorTeamName,
            venueName: element[0].venueName,
            refereeInformation: refereeInfo[0]  
          };
        }
      else{
        return {
          matchID: element[0].match_id,
          matchDate: getDateTimeDisplayFormat(element[0].matchDateAndTime),
          localTeamName: element[0].localTeamName,
          visitorTeamName: element[0].visitorTeamName,
          venueName: element[0].venueName,
        };
      }
    })
    );
}
exports.extractMatchesInfo = extractMatchesInfo;


//* ---------------------------- Check Favorite Matches ---------------------------- *//

async function checkFavoriteMatches(matches_ids_array) {
  
  var favoriteMatchesAfterCheck = [];

  for ( var i=0 ; i < matches_ids_array.length ; i++){
    needChange = await checkIfNeedChangeFromFuture(matches_ids_array[i]);
    
    if ( ! needChange ){
      favoriteMatchesAfterCheck.push(matches_ids_array[i]);
    }
  }

  return favoriteMatchesAfterCheck;
  
}
exports.checkFavoriteMatches = checkFavoriteMatches;


//* ---------------------------- Check If Need Change From Future ---------------------------- *//
  
async function checkIfNeedChangeFromFuture(match_id) {
  
  var todayDateTime = getTodayDateTime();

  var match = await matches_utils.getMatchByID(match_id);

  if ( Date.parse(todayDateTime) > Date.parse(match[0].matchDateAndTime) ){

    await matches_utils.matchFromFutureToPast(match[0].match_id);
    return true;

  }
  return false;
  
}
exports.checkIfNeedChangeFromFuture = checkIfNeedChangeFromFuture;

