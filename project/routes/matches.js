var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const matches_domain = require("./domains/matches_domain");


//* ------------------------------ Get Current Stage Matches------------------------------ *//


router.get("/currentStageMatches", async (req, res, next) => {
  try {
    
    var resultFromDomain = await matches_domain.getMatchesToCurrentStage();

    var futureMatches = resultFromDomain.futureMatches;
    var pastMatches = resultFromDomain.pastMatches;

    var resultResponse ={};
    resultResponse["pastMatches"] = pastMatches;
    resultResponse["futureMatches"] = futureMatches;

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});



module.exports = router;

