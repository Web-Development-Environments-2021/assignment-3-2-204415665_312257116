var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const matches_utils = require("./utils/matches_utils");



//* ------------------------------ /getDetails ------------------------------ *//

router.get("/getDetails", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();
    league_details.first_next_match = await matches_utils.getFirstNextMatch();
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
