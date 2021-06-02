var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const matches_utils = require("./utils/matches_utils");

/**
 * Authenticate all incoming requests by middleware
 */
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


//* ------------------------------ Get Past Match By ID------------------------------ *//


router.get("/currentStageMatches", async (req, res, next) => {
  try {
    
    const leagueMatches = await matches_utils.getLeagueMatches();

    const futureMatchesWithReferees = await SortMatchesBy(await addRefereeToFutureMatches(leagueMatches[1]), "Date", "future");
    const pastMatchesWithReferees = await SortMatchesBy(await addRefereeToPastMatches(leagueMatches[0]), "Date", "past");

    var resultResponse ={};
    resultResponse["pastMatches"] = pastMatchesWithReferees;
    resultResponse["featureMatches"] = futureMatchesWithReferees;

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
      matchDateAndTime : element.matchDateAndTime,
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