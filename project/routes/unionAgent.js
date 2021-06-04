var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");

const matches_domain = require("./domains/matches_domain");
const unionAgent_domain = require("./domains/unionAgent_domain");

/**
 * Authenticate all incoming requests by middleware
 */
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

    var futureMatchesWithReferees , pastMatchesWithReferees = await matches_domain.getMatchesToLeagueManagementPage(sortBy);

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

    const dataForUnionAgent = await unionAgent_domain.getAllDataForAddMatch();

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

    var badRequest ,message = await unionAgent_domain.checkInputForAddMatch(localTeamName, visitorTeamName, venueName, refereeID);

    if (!badRequest){

      await unionAgent_domain.InsertNewMatch(matchDate, localTeamName, visitorTeamName, venueName, refereeID);
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

    const pastMatchesWithoutResult = await unionAgent_domain.getPastMatchesToAddResult();

    res.status(200).send(pastMatchesWithoutResult);
  } catch (error) {
    next(error);
  }
});


router.put("/addMatchResult", async (req, res, next) => {
  try {
    const matchID = req.body.matchID;
    const localTeamScore = req.body.localTeamScore;
    const visitorTeamScore = req.body.visitorTeamScore;
    
    var badRequest, message =  await unionAgent_domain.checkInputForAddResult(matchID, localTeamScore, visitorTeamScore);

    
    if (! badRequest){

      var match ,whichMatch = await unionAgent_domain.checkIfPastOrFuture(matchID);

      if (whichMatch == "future"){
        
        badRequest, message =  await unionAgent_domain.InsertFutureMatchResult(match, matchID, localTeamScore, visitorTeamScore);
        
      } else {

        badRequest, message = await unionAgent_domain.InsertPastMatchResult(match, matchID, localTeamScore, visitorTeamScore);

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

    const pastMatchesWithAllInfo = await unionAgent_domain.getPastMatchesToAddEventLog();

    res.status(200).send(pastMatchesWithAllInfo);
  } catch (error) {
    next(error);
  }
});

router.put("/addMatchEventsLog", async (req, res, next) => {
  try {

    const matchID = req.body.matchID;
    const eventsLog = req.body.eventsLog;

    var badRequest, message =  await unionAgent_domain.InsertMatchEventLog(matchID, eventsLog);

    
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

    const matchesWithoutReferee = await unionAgent_domain.getPastMatchesToAddReferee();

    res.status(200).send(matchesWithoutReferee);
  } catch (error) {
    next(error);
  }
});

router.put("/addRefereeToMatch", async (req, res, next) => {
  try {

    const matchID = req.body.matchID;
    const refereeID = req.body.refereeID;

    var badRequest, message = await unionAgent_domain.checkInputForAddReferee(matchID, refereeID);


 
    if (!badRequest) {
      var futureMatch, pastMatch = await unionAgent_domain.getMatchForAddReferee(matchID);
    }
    
    if (futureMatch.length != 0 || pastMatch.length !=0 ){

      badRequest, message = await unionAgent_domain.InsertRefereeToMatch(matchID, refereeID, futureMatch, pastMatch);

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


