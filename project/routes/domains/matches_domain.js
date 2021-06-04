
const matches_utils = require("../utils/matches_utils");

//* ------------------------------ Help Functions ------------------------------ *//


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
    var dateTime = new Date(dateTime);
    var month, day, hours, minutes, seconds;
    if ((dateTime.getMonth()+1) < 10){
      month = '0' + (dateTime.getMonth()+1);
    } else{
      month = (dateTime.getMonth()+1);
    }
    if (dateTime.getDate() < 10){
      day = '0' +  (dateTime.getDate());
    } else {
      day = (dateTime.getDate());
    }
    if (dateTime.getHours() < 10){
      hours = '0' + dateTime.getHours();
    } else{
      hours = dateTime.getHours();
    }
    if (dateTime.getMinutes() < 10){
      minutes = '0' + dateTime.getMinutes();
    } else{
      minutes = dateTime.getMinutes();
    }
    if (dateTime.getSeconds() < 10){
      seconds = '0' + dateTime.getSeconds();
    } else {
      seconds = dateTime.getSeconds();
    }
  
    var date = dateTime.getFullYear()+'-'+month+'-'+day;
    var time = hours + ":" + minutes + ":" + seconds;
    var dateTime = date+' '+time;
return dateTime;
}
exports.getDateTimeDisplayFormat = getDateTimeDisplayFormat;

//* ------------------------------ Get Matches To League Management Page ------------------------------ *//

async function getMatchesToLeagueManagementPage(sortBy){

  const leagueMatches = await matches_utils.getLeagueMatches();

  const futureMatchesWithReferees = await SortMatchesBy(await addRefereeToFutureMatches(leagueMatches[1]), sortBy, "future");
  const pastMatchesWithReferees = await SortMatchesBy(await addRefereeToPastMatches(leagueMatches[0]), sortBy, "past");

  return futureMatchesWithReferees, pastMatchesWithReferees;

}
exports.getMatchesToLeagueManagementPage = getMatchesToLeagueManagementPage;


//* ------------------------------ Get Matches To Current Stage ------------------------------ *//

async function getMatchesToCurrentStage(){

  const leagueMatches = await matches_utils.getLeagueMatches();

  const futureMatchesWithReferees = await SortMatchesBy(await addRefereeToFutureMatches(leagueMatches[1]), "Date", "future");
  const pastMatchesWithReferees = await SortMatchesBy(await addRefereeToPastMatches(leagueMatches[0]), "Date", "past");

  return futureMatchesWithReferees, pastMatchesWithReferees;

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
      matchesWithReferee[i]["refereeInformation"] = refereeDic[0];
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
      matchDateAndTime : getDateTimeDisplayFormat(element.matchDateAndTime),
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
    matchesWithReferee[i]["refereeInformation"] = refereeDic[0];
    delete matchesWithReferee[i]["refereeID"]

    var eventDic = await matches_utils.extractEventLog(matchesWithReferee[i]["matchID"]);
    matchesWithReferee[i]["eventsLog"] = eventDic;

  }
  return matchesWithReferee;
}
exports.addRefereeToPastMatches = addRefereeToPastMatches;
  

//* ------------------------------ Sort Matches By Date ------------------------------ *//
  
async function SortMatchesBy(matchesToAdd, sortBy, futureOrPast){
  
  if (sortBy == "Date"){
    if (futureOrPast == "future"){
      var SortedMatches = matchesToAdd.sort((a, b) => a["matchDate"] - b["matchDate"]);
    } else{
      var SortedMatches = matchesToAdd.sort((a, b) => a["matchDateAndTime"] - b["matchDateAndTime"]);
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
  var types = ['Goal', 'Red Card', 'Yellow Card', 'Injury', 'Subsitute'];
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
        getFutureMatchByID(match_id)
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