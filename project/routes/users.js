var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const matches_domain = require("./domains/matches_domain");

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
    if (!Number.isInteger(match_id)){    //Checks if the user's input is correct
      res.status(400).send("Bad request");
    }
    const flag = await users_utils.markMatchesAsFavorite(user_id, match_id);

    //In case of success/failure - return an appropriate error.
    if (flag){
      res.status(201).send("The match successfully saved as favorite");
    }
    else{
      res.status(400).send("Bad request");
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
    const matches_ids = await users_utils.getFavoriteMatches(user_id);
    let matches_ids_array = [];
    matches_ids.map((element) => matches_ids_array.push(element.match_id)); //extracting the players ids into array
    const results = await matches_domain.getMatchesInfo(matches_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


