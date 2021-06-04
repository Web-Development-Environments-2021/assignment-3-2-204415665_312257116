var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
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


//* ------------------------------ Get Past Match By ID------------------------------ *//


router.get("/currentStageMatches", async (req, res, next) => {
  try {
    
    var futureMatchesWithReferees , pastMatchesWithReferees = await matches_domain.getMatchesToCurrentStage();

    var resultResponse ={};
    resultResponse["pastMatches"] = pastMatchesWithReferees;
    resultResponse["featureMatches"] = futureMatchesWithReferees;

    res.status(200).send(resultResponse);
  } catch (error) {
    next(error);
  }
});



module.exports = router;

