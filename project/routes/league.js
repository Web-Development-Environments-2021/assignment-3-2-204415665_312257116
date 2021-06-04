var express = require("express");
var router = express.Router();

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
    var badRequest = false;

    const { Search_Query } = req.params;
    const { Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players } = req.query;

    //Check that  The query contain only English characters 
    if (/[^a-z]/i.test(Search_Query)){
      message="The query must contain English characters only";
      badRequest=true;
    }

    //Check that if the user search for a players the filter field contain only numbers/characters in English
    if (Search_Type=="Players" && (/[^a-z]/i.test(Filter_Players) && isNaN(Filter_Players))){
      message="The filter field must contain either numbers or characters in English";
      badRequest=true;
    }

    //Check that if the user search for a players and wants to sort he must choose a sort form
    if(Sort_Players=="yes" && (Sort_Players_By!="own name" && Sort_Players_By!="team name")){
      message="Please select a sort form";
      badRequest=true;
    }

    //if one of the entered values are not valid - if not raises error
    if (badRequest){
      res.status(400).send("Bad request - Invalid value - :  " + message);
    }
    else{
          //Submitting the request for an auxiliary function - SQL_searchByQuery
          const results = await league_domain.SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players);
          res.status(200).send(results);
    }

    } catch (error) {
      next(error);
    }
});


module.exports = router;



