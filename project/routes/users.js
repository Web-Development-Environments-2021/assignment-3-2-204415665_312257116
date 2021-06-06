var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const matches_domain = require("./domains/matches_domain");
const user_domain = require("./domains/user_domain");

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


//* ------------------------------ /favoritePlayers ------------------------------ *//

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const match_id = req.body.matchId;
    var message=null;
    if (Number.isInteger(match_id)){    //Checks if the user's input is correct
      message = await user_domain.markMatchesAsFavorite_domain(user_id, match_id);
    }
    else{
      message="Invalid value";
    }

    //In case of success/failure - return an appropriate error.
    if (message==null){
      res.status(201).send("The match successfully saved as favorite");
    }
    else{
      res.status(400).send("Bad request - incorrect :  " + message);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    let matches_ids_array = await user_domain.getFavoriteMatches_domain(user_id);
    matchesID_AfterCheck = await matches_domain.checkFavoriteMatches(matches_ids_array);
    const results = await matches_domain.getMatchesInfo(matchesID_AfterCheck);
    if (results.length==0){
      res.sendStatus(204);
    }
    else{
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});


router.delete("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const match_ID = req.query.matchID;

    var badRequest = false;
    var message = "";
    
    try{
      var matchID = parseInt(match_ID);

      var resultFromDomain = await user_domain.deleteUserFavoriteMatch(user_id, matchID);

      badRequest = resultFromDomain.badRequest;
      message = resultFromDomain.message;

    } catch(error){
      badRequest = true;
      message += " matchID is not int,"
    }

    

    if (!badRequest){

      
      res.status(200).send( "Match deleted from user's favorite matches successfully" ) ;

    } else if ( badRequest && message != "Match not found" ){

      res.status(400).send("Bad request - incorrect :  " + message);

    } else {

      res.status(404).send(message);

    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;


