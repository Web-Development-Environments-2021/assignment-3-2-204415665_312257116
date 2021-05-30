var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
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


//* ------------------------------ /favoritePlayers ------------------------------ *//

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoriteMatches", async (req, res, next) => {
  try {

    const user_id = req.session.user_id;
    const match_id = req.body.matchId;
    const flag =await users_utils.markMatchesAsFavorite(user_id, match_id);
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
    let favorite_matches = {};
    const matches_ids = await users_utils.getFavoriteMatches(user_id);
    let matches_ids_array = [];
    matches_ids.map((element) => matches_ids_array.push(element.match_id)); //extracting the players ids into array
    const results = await matches_utils.getMatchesInfo(matches_ids_array);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});


/*----------------------------- search -----------------------------*/
//Returns all results according to the user's search query
  router.get("/search/:Search_Query", async (req, res, next) => {
    try {
      //Extracting the relevant information from the query
      const { Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players } = req.query; 
      const { Search_Query } = req.params;
      var results = users_utils.SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players);
      res.status(200).send(results);

      } catch (error) {
        next(error);
      }
});
module.exports = router;
