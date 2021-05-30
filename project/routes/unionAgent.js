var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const unionAgent_utils = require("./utils/unionAgent_utils");

/**
 * Authenticate all incoming requests by middleware
 */
//TODO: Need To Authenticate UnionAgent
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
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
// TODO: What to do With Sort 
/**
 * This path gets parameter with sort information and Return all matches
 */
 router.get("/leagueManagementPage", async (req, res, next) => {
  try {

    const sortBy = req.query.sortBy;

    const leagueMatches = await unionAgent_utils.getLeagueMatches();

    const featureMatchesWithReferees = await addRefereeToFutureMatches(leagueMatches[1]);
    const pastMatchesWithReferees = await addRefereeToPastMatches(leagueMatches[0]);

    var resultResponse ={};
    resultResponse["pastMatches"] = pastMatchesWithReferees;
    resultResponse["featureMatches"] = featureMatchesWithReferees;

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});



//* ------------------------------ /addMatch ------------------------------ *//

/**
 * This path gets body with match information and save new match in the matches DB
 */
 router.post("/addMatch", async (req, res, next) => {
  try {
    const matchDate = req.body.matchInformation.matchDate;
    const localTeamName = req.body.matchInformation.localTeamName;
    const visitorTeamName = req.body.matchInformation.visitorTeamName;
    const venueName = req.body.matchInformation.venueName;
    const refereeID = req.body.refereeID;

    //TODO: Sanity Check ?? (Date)

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    if (dateTime < matchDate){
      await unionAgent_utils.addNewFutureMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
    } else{
      await unionAgent_utils.addNewPastMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
    }

    res.status(200).send("Match added to league's matches successfully");
  } catch (error) {
    next(error);
  }
});


//* ------------------------------ /addMatchResult ------------------------------ *//

/**
 * This path gets body with match's result and save matches DB
 */
 router.post("/addMatchResult", async (req, res, next) => {
  try {
    const matchID = req.body.matchID;
    const localTeamScore = req.body.localTeamScore;
    const visitorTeamScore = req.body.visitorTeamScore;
    var foundMatch = false;
    var badRequest = false;

    //TODO: Add Sanity Check
    if (visitorTeamScore < 0 || localTeamScore < 0 || !Number.isInteger(matchID) ||
        !Number.isInteger(localTeamScore) || 
        !Number.isInteger(visitorTeamScore)){
      badRequest = true;

    }

    const leagueMatches = await unionAgent_utils.getLeagueMatches();
    var futureMatches = leagueMatches[1];
    var pastMatches = leagueMatches[0];

    for (var i = 0 ; i < futureMatches.length ; i++){

      if (badRequest){
        break;
      }
      if (matchID != futureMatches[i]["match_id"]){
        continue;
      }
      foundMatch = true;
      
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      if (dateTime < futureMatches[i]["matchDateAndTime"]){
        //Match's Date is in the future
        badRequest = true;
      }

      var matchDate = futureMatches[i]["matchDateAndTime"];
      var localTeamName = futureMatches[i]["localTeamName"];
      var visitorTeamName = futureMatches[i]["visitorTeamName"];
      var venueName = futureMatches[i]["venueName"];
      var refereeID = futureMatches[i]["refereeID"];

      await unionAgent_utils.addFutureMatchResult(matchID, matchDate, localTeamName, visitorTeamName, venueName, refereeID, localTeamScore, visitorTeamScore);
    }

    if (!foundMatch && !badRequest){

      for (var i = 0 ; i < pastMatches.length ; i++){

        if (matchID != pastMatches[i]["match_id"]){
          continue;
        }
        foundMatch = true;

        var localTeamScore_DB = pastMatches[i]["localTeamScore"];
        var visitorTeamScore_DB = pastMatches[i]["visitorTeamScore"];
        if (localTeamScore_DB != null && visitorTeamScore_DB != null){
          //The Match Already as Result
          badRequest = true;
          break;
        }
        await unionAgent_utils.addPastMatchResult(matchID, localTeamScore, visitorTeamScore);
        break;
      }
    }

    if (foundMatch && !badRequest){
      res.status(200).send("Result added to match successfully");
    } else{
      res.status(400).send("Bad request");
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

    const matchID = req.body.matchID;
    const eventsLog = req.body.eventsLog;

    var badRequest = false;
    const match = await unionAgent_utils.getMatchByID(matchID);
    
    
    

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});




module.exports = router;








//* ------------------------------ Help Functions ------------------------------ *//



//* ------------------------------ Add Referee To Future Matches ------------------------------ *//

async function addRefereeToFutureMatches(matchesToAdd){

  var matchesWithReferee = [];
  matchesToAdd.map((element) => matchesWithReferee.push(
     {
      matchID : element.match_id,
      matchDate : element.matchDateAndTime,
      localTeamName : element.localTeamName,
      visitorTeamName : element.visitorTeamName,
      venueName : element.venueName,
      refereeID : element.refereeID
    }
  ));

  for (var i = 0 ; i < matchesWithReferee.length ; i++){

    var refereeDic = await unionAgent_utils.extractRefereeInfo(matchesWithReferee[i]["refereeID"]);
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
      matchDateAndTime : element.matchDateAndTime,
      localTeamName : element.localTeamName,
      visitorTeamName : element.visitorTeamName,
      venueName : element.venueName,
      refereeID : element.refereeID,
      localTeamScore : element.localTeamScore,
      visitorTeamScore : element.visitorTeamScore,
      firstEventID : element.firstEventID
    }
  ));

  for (var i = 0 ; i < matchesWithReferee.length ; i++){

    var refereeDic = await unionAgent_utils.extractRefereeInfo(matchesWithReferee[i]["refereeID"]);
    matchesWithReferee[i]["refereeInformation"] = refereeDic[0];
    delete matchesWithReferee[i]["refereeID"]

    var eventDic = await unionAgent_utils.extractEventLog(matchesWithReferee[i]["firstEventID"]);
    matchesWithReferee[i]["eventsLog"] = eventDic;
    delete matchesWithReferee[i]["firstEventID"]

  }
  return matchesWithReferee;
}




