var express = require("express");
var router = express.Router();
const teams_domain = require("./domains/teams_domain");



//* ------------------------------ /teamFullDetails/:teamId ------------------------------ *//

router.get("/teamFullDetails/:teamId", async (req, res, next) => {
  try {
    const team_details = await teams_domain.extractRelevantTeamData(req.params.teamId);
    //we should keep implementing team page.....
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
