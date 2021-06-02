var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const unionAgent_utils = require("./utils/unionAgent_utils");
const matches_utils = require("./utils/matches_utils");
const league_utils = require("./utils/league_utils");

/**
 * Authenticate all incoming requests by middleware
 */
//TODO: Need To Authenticate UnionAgent
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id  == 4) {
    DButils.execQuery("SELECT user_id FROM Users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});



//* ------------------------------ /leagueManagementPage ------------------------------ *//
/**
 * This path gets parameter with sort information and Return all matches
 */
router.get("/leagueManagementPage", async (req, res, next) => {
  try {

    const sortBy = req.query.sortBy;

    const leagueMatches = await matches_utils.getLeagueMatches();

    const futureMatchesWithReferees = await SortMatchesBy(await addRefereeToFutureMatches(leagueMatches[1]), sortBy, "future");
    const pastMatchesWithReferees = await SortMatchesBy(await addRefereeToPastMatches(leagueMatches[0]), sortBy, "past");

    var resultResponse ={};
    resultResponse["pastMatches"] = pastMatchesWithReferees;
    resultResponse["featureMatches"] = futureMatchesWithReferees;

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});



//* ------------------------------ /addMatch ------------------------------ *//

/**
 * This path gets body with match information and save new match in the matches DB
 */

 router.get("/addMatch", async (req, res, next) => {
  try {

    const teamsNames = await league_utils.getTeamsNames();
    const venuesNames = await league_utils.getVenuesNames();
    const referees = await unionAgent_utils.getAllReferees();

    const dataForUnionAgent = {
      teamsNames : teamsNames,
      venuesName : venuesNames,
      referees : referees 
    }

    res.status(200).send(dataForUnionAgent);
  } catch (error) {
    next(error);
  }
});



router.post("/addMatch", async (req, res, next) => {
  try {
    const matchDate = req.body.matchInformation.matchDate;
    const localTeamName = req.body.matchInformation.localTeamName;
    const visitorTeamName = req.body.matchInformation.visitorTeamName;
    const venueName = req.body.matchInformation.venueName;
    const refereeID = req.body.refereeID;

    var badRequest = false;
    var message = "";

    if (! await league_utils.checkTeamNames(localTeamName, visitorTeamName)){
      badRequest = true;
      message = " teams names,";
    } 
    if(! await league_utils.checkVenueName(venueName)){
      badRequest = true;
      message += "  venue name,"
    } 
    if(refereeID != undefined){
      var referee = (await unionAgent_utils.getRefereeByID(refereeID));
      if (referee.length == 0){
        badRequest = true;
        message += "  referee ID"
      }
    }

    if (!badRequest){
      var dateTime =  getTodayDatTime();
      if (Date.parse(dateTime) < Date.parse(matchDate)){
        await unionAgent_utils.addNewFutureMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
      } else{
        await unionAgent_utils.addNewPastMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
      }
  
      res.status(200).send("Match added to league's matches successfully");
    } else {
      res.status(400).send("Bad request - incorrect :  " + message);
    }

  } catch (error) {
    next(error);
  }
});





//* ------------------------------ /addMatchResult ------------------------------ *//

/**
 * This path gets body with match's result and save matches DB
 */

router.get("/addMatchResult", async (req, res, next) => {
  try {

    const pastMatchesWithoutResult = await unionAgent_utils.GetPastMatchesWithoutResult();

    const resultResponse = {
      pastMatchesWithoutResult : pastMatchesWithoutResult
    }

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});


router.put("/addMatchResult", async (req, res, next) => {
  try {
    const matchID = req.body.matchID;
    const localTeamScore = req.body.localTeamScore;
    const visitorTeamScore = req.body.visitorTeamScore;
    
    var badRequest = false;
    var message = "";

    if (visitorTeamScore < 0 || localTeamScore < 0 ||
        !Number.isInteger(localTeamScore) || 
        !Number.isInteger(visitorTeamScore)){
      badRequest = true;
      message += " scores,";
    }
    if (!Number.isInteger(matchID)) {
      badRequest = true;
      message += " match ID,";
    } else if (Number.isInteger(matchID)){
      var match = await matches_utils.getMatchByID(matchID);
      if (match.length == 0){
        badRequest = true;
        message += " match doesn't exist,";
      }
    }

    if (! badRequest){

      var match = await matches_utils.getPastMatchByID(matchID);
      var whichMatch = "past";

      if (match.length == 0){
        match = await matches_utils.getFutureMatchByID(matchID);
        whichMatch = "future";
      }
      if (whichMatch == "future"){
        var dateTime =  getTodayDatTime();
        
        if (Date.parse(dateTime) < Date.parse(match[0]["matchDateAndTime"])){
          //Match's Date is in the future
          badRequest = true;
          message += " Date Time,";

        } else {
          var matchDate = match[0].matchDateAndTime;
          var localTeamName = match[0].localTeamName;
          var visitorTeamName = match[0].visitorTeamName;
          var venueName = match[0].venueName;
          var refereeID = match[0].refereeID;
          matchDate = getTDateTime(matchDate);
          await unionAgent_utils.addFutureMatchResult(matchID, matchDate, localTeamName, visitorTeamName, venueName, refereeID, localTeamScore, visitorTeamScore);
        }
      } else {

        var localTeamScore_DB = match[0]["localTeamScore"];
        var visitorTeamScore_DB = match[0]["visitorTeamScore"];

        if (localTeamScore_DB != null && visitorTeamScore_DB != null){
          //The Match Already as Result
          badRequest = true;
          message += " match already has score"
        } else {
          await unionAgent_utils.addPastMatchResult(matchID, localTeamScore, visitorTeamScore);
        }
      }
    }

    if (!badRequest){
      res.status(200).send("Result added to match successfully");
    } else{
      res.status(400).send("Bad request - incorrect :  " + message);
    }
  } catch (error) {
    next(error);
  }
});


//* ------------------------------ /addMatchEventsLog ------------------------------ *//

/**
 * This path gets body with match's Events Log and save matches DB
 */
router.get("/addMatchEventsLog", async (req, res, next) => {
  try {

    const leagueMatches = await matches_utils.getLeagueMatches();

    const pastMatchesWithAllInfo = await addRefereeToPastMatches(leagueMatches[0]);

    const resultResponse = {
      pastMatchesWithAllInfo : pastMatchesWithAllInfo
    }

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});

router.put("/addMatchEventsLog", async (req, res, next) => {
  try {

    const matchID = req.body.matchID;
    const eventsLog = req.body.eventsLog;

    var badRequest = false;
    var message = "";

    const match = await matches_utils.getPastMatchByID(matchID);
    var dateTime =  getTodayDatTime();

    if (match.length != 0){
      
      for (var i = 0 ; i < eventsLog.length ; i++){

        if (Date.parse(eventsLog[i]["eventTimeAndDate"]) >= Date.parse(dateTime)){
          badRequest = true;
          message += " date time,";
        }
        if (!Number.isInteger(eventsLog[i]["minuteInMatch"]) || eventsLog[i]["minuteInMatch"] < 0 || eventsLog[i]["minuteInMatch"] > 130){
          badRequest = true;
          message += " minute in match,"
        }
        if (!checkEventType(eventsLog[i]["eventType"])){
          badRequest = true;
          message += " event type";
        }
        if (badRequest){
          break;
        }

        var eventTimeAndDate = eventsLog[i]["eventTimeAndDate"];
        var minuteInMatch = eventsLog[i]["minuteInMatch"];
        var eventType = eventsLog[i]["eventType"];
        var eventDescription = eventsLog[i]["eventDescription"];
        if (eventDescription == undefined){
          eventDescription = 'null';
        }

        await unionAgent_utils.addEvent(matchID, eventTimeAndDate, minuteInMatch, eventType, eventDescription);
      }
    } else{
      badRequest = true;
      message += " match doesn't exist";
    }

    if (badRequest){
      res.status(400).send("Bad request - incorrect :  " + message);
    } else {
      res.status(200).send("Events log added match successfully");
    }
  } catch (error) {
    next(error);
  }
});



//* ------------------------------ /addRefereeToMatch ------------------------------ *//

router.get("/addRefereeToMatch", async (req, res, next) => {
  try {

    const referees = await unionAgent_utils.getAllReferees();
    const matchesWithoutReferee = await unionAgent_utils.GetAllMatchesWithoutReferee();

    const dataForUnionAgent = {
      referees : referees,
      futureMatchesWithoutReferee : matchesWithoutReferee[1],
      pastMatchesWithReferees : matchesWithoutReferee[0]
    }

    res.status(200).send(dataForUnionAgent);
  } catch (error) {
    next(error);
  }
});

router.put("/addRefereeToMatch", async (req, res, next) => {
  try {

    const matchID = req.body.matchID;
    const refereeID = req.body.refereeID;

    var badRequest = false;
    var message = "";

    if ( !Number.isInteger(matchID)){
      badRequest = true;
      message += " match ID,"
    } 
    if ( !Number.isInteger(refereeID)){
      badRequest = true;
      message += " referee ID,";
    }
    if (!badRequest) {
      var futureMatch = await matches_utils.getFutureMatchByID(matchID);
      var pastMatch = await matches_utils.getPastMatchByID(matchID);
    }
    
    if (futureMatch.length != 0 || pastMatch.length !=0 ){

      var refereeInfo = await unionAgent_utils.getRefereeByID(refereeID);

      if ( refereeInfo.length != 0 ){
        if (futureMatch.length != 0 && futureMatch[0]["refereeID"] == null){
          await unionAgent_utils.addRefereeToFutureMatch(matchID, refereeID);
        } else if (pastMatch.length != 0 && pastMatch[0]["refereeID"] == null){
          await unionAgent_utils.addRefereeToPastMatch(matchID, refereeID);
        } else {
          badRequest = true;
          message += " already has referee";
        }
      } else{
        badRequest = true;
        message += " referee doesn't exist";
      }

    } else{
      badRequest = true;
      message += " match doesn't exist";
    }

    if (badRequest){
      res.status(400).send("Bad request - incorrect :  " + message);
    } else {
      res.status(200).send("Referee added to match successfully");
    }
  } catch (error) {
    next(error);
  }
});



module.exports = router;





//* ------------------------------ Help Functions ------------------------------ *//


//* ------------------------------ Get Today DataTime ------------------------------ *//

function getTodayDatTime(){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return dateTime;
}

//* ------------------------------ Get DataTime ------------------------------ *//

function getTDateTime(dateTime){
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



//* ------------------------------ Add Referee To Future Matches ------------------------------ *//

async function addRefereeToFutureMatches(matchesToAdd){

  var matchesWithReferee = [];
  matchesToAdd.map((element) => matchesWithReferee.push(
     {
      matchID : element.match_id,
      matchDate : getTDateTime(element.matchDateAndTime),
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


//* ------------------------------ Add Referee To Past Matches ------------------------------ *//

async function addRefereeToPastMatches(matchesToAdd){

  var matchesWithReferee = [];
  matchesToAdd.map((element) => matchesWithReferee.push(
     {
      matchID : element.match_id,
      matchDateAndTime : getTDateTime(element.matchDateAndTime),
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

//* ------------------------------ Check EventType ------------------------------ *//

function checkEventType(eventType){
  var types = ['Goal', 'Red Card', 'Yellow Card', 'Injury', 'Subsitute'];
  if (types.includes(eventType)){
    return true;
  }
  return false;
}