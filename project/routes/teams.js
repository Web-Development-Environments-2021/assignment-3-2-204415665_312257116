var express = require("express");
var router = express.Router();
const teams_domain = require("./domains/teams_domain");



//* ------------------------------ /teamFullDetails/:teamId ------------------------------ *//

router.get("/teamFullDetailsByID/:teamId", async (req, res, next) => {
  try {
    const team_details = await teams_domain.extractRelevantTeamData(req.params.teamId);
    //we should keep implementing team page.....
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});


//* ------------------------------ /teamFullDetails/:teamName ------------------------------ *//

router.get("/teamFullDetailsByName/:teamName", async (req, res, next) => {
  try {
    const teamName = decodeURI(req.params.teamName);

    const team_details = await teams_domain.getTeamDetailsByName(teamName);
    //we should keep implementing team page.....
    res.send(team_details);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
