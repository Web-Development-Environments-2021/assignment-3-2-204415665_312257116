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


//* ------------------------------ /addMatch ------------------------------ *//

/**
 * This path gets body with match inforamtion and save new match in the matches DB
 */
 router.post("/addMatch", async (req, res, next) => {
  try {
    const matchDate = req.body.matchInfomation.matchDate;
    const loaclTeamName = req.body.matchInfomation['loaclTeamName'];
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