var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
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


//* ------------------------------ /addMatch ------------------------------ *//

/**
 * This path gets body with match inforamtion and save new match in the matches DB
 */
 router.post("/addMatch", async (req, res, next) => {
  try {
    const matchDate = req.body.matchDate;
    const loaclTeamName = req.body.loaclTeamName;
    const visitorTeamName = req.body.visitorTeamName;
    const venueName = req.body.venueName;
    

    await users_utils.markPlayerAsFavorite(user_id, player_id);
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});


module.exports = router;