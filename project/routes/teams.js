var express = require("express");
var router = express.Router();
const teams_domain = require("./domains/teams_domain");



//* ------------------------------ /teamFullDetails/:teamId ------------------------------ *//

router.get("/teamFullDetailsByID/:teamId", async (req, res, next) => {
  try {
    const team_details = await teams_domain.extractRelevantTeamData(req.params.teamId);
    //we should keep implementing team page.....
    if (!team_details[0]){
      res.status(404).send("team name is not exists");
    }
    else{
      res.status(200).send(team_details);
    }
  } catch (error) {
    next(error);
  }
});


//* ------------------------------ /teamFullDetails/:teamName ------------------------------ *//

router.get("/teamFullDetailsByName/:teamName", async (req, res, next) => {
  try {
    const teamName = decodeURI(req.params.teamName);

    const team_details = await teams_domain.getTeamDetailsByName(teamName);
    if(!team_details[0]){
      res.status(404).send("team name is not exists");
    }
    else{
      res.status(200).send(team_details);
    }
    //we should keep implementing team page.....
  } catch (error) {
    next(error);
  }
});
module.exports = router;
