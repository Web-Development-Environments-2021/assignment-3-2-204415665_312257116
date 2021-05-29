var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const unionAgent_utils = require("./utils/unionAgent_utils");

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

    var resultRespone ={};
    resultRespone["pastMatches"] = pastMatchesWithReferees;
    resultRespone["featureMatches"] = featureMatchesWithReferees;

    res.status(200).send(resultRespone);
  } catch (error) {
    next(error);
  }
});



//* ------------------------------ /addMatch ------------------------------ *//

/**
 * This path gets body with match inforamtion and save new match in the matches DB
 */
 router.post("/addMatch", async (req, res, next) => {
  try {
    const matchDate = req.body.matchInfomation.matchDate;
    const loaclTeamName = req.body.matchInfomation.loaclTeamName;
    const visitorTeamName = req.body.matchInfomation.visitorTeamName;
    const venueName = req.body.matchInfomation.venueName;
    const refereeID = req.body.refereeID;

    await unionAgent_utils.addNewMatch(matchDate, loaclTeamName, visitorTeamName, venueName, refereeID);
    res.status(200).send("Match added to league's matches successfully");
  } catch (error) {
    next(error);
  }
});


module.exports = router;



//* ------------------------------ Help Functions ------------------------------ *//


async function addRefereeToFutureMatches(matchesToAdd){

  var matchesWithReferee = [];
  matchesToAdd.map((element) => matchesWithReferee.push(
     {
      matchDate : element.matchDateAndTime,
      loaclTeamName : element.localTeamName,
      visitorTeamName : element.visitorTeamName,
      venueName : element.venueName,
      refereeID : element.refereeID
    }
  ));

  for (var i = 0 ; i < matchesWithReferee.length ; i++){

    var refereeDic = await unionAgent_utils.extractRefereeInfo(matchesWithReferee[i]["refereeID"]);
    matchesWithReferee[i]["refereeInforamtion"] = refereeDic[0];
    delete matchesWithReferee[i]["refereeID"]
  }
  return matchesWithReferee;
}

async function addRefereeToPastMatches(matchesToAdd){

  var matchesWithReferee = [];
  matchesToAdd.map((element) => matchesWithReferee.push(
     {
      matchDateAndTime : element.matchDateAndTime,
      loaclTeamName : element.localTeamName,
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
    matchesWithReferee[i]["refereeInforamtion"] = refereeDic[0];
    delete matchesWithReferee[i]["refereeID"]

    var eventDic = await unionAgent_utils.extractEventLog(matchesWithReferee[i]["firstEventID"]);
    matchesWithReferee[i]["eventsLog"] = eventDic;
    delete matchesWithReferee[i]["firstEventID"]

  }
  return matchesWithReferee;
}




