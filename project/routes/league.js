var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");

const league_domain = require("./domains/league_domain");



//* ------------------------------ /getDetails ------------------------------ *//

router.get("/getDetails", async (req, res, next) => {
  try {
    const league_details = await league_domain.getLeagueInfoForMainPage();

    league_details.first_next_match = await league_domain.getNextLeagueMatch();

    //TODO: Add 3 Favorite Matches

    res.send(league_details);
  } catch (error) {
    next(error);
  }
});


/*----------------------------- search -----------------------------*/
//Returns all results according to the user's search query
router.get("/search/:Search_Query", async (req, res, next) => {
  try {
    //Extracting the relevant information from the query
    const { Search_Query } = req.params;
    const { Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players } = req.query; 
    //Check that all entered values are valid
    if (/[^a-z]/i.test(Search_Query) || (/[^a-z]/i.test(Filter_Players) && isNaN(Filter_Players))){
      res.status(400).send("Bad request - Invalid values");
    }
    //Submitting the request for an auxiliary function - SQL_searchByQuery
    const results = await league_utils.SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players);
    res.status(200).send(results);
    } catch (error) {
      next(error);
    }
});


module.exports = router;



