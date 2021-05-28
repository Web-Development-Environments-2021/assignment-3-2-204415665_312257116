//init
const DButils = require("./DButils");

//------------- -------------------- -------------
//--------------- Referee funcsion ---------------
//------------- -------------------- -------------

//-----------------get-----------------
async function getRefereeByID(referee_id) {
    const Referee = await DButils.execQuery(
      `select firstname,lastname,course from Referee where referee_id='${referee_id}'`
    );
    return Referee;
  }
  exports.getRefereeByID = getRefereeByID;
  
//-----------------insert-----------------
async function addReferee2Table(firstname, lastname, course) {
    await DButils.execQuery(
      `insert into Referee values (${firstname},${lastname},${course})`
    );
  }
  exports.addReferee2Table = addReferee2Table;

//----------------------------------------  
router.get("/Referee", async (req, res, next) => {
try {
    const referee_id = req.session.referee_id;
    const referee = await getFavoritePlayers(referee_id);
} catch (error) {
    next(error);
}
});

//------------- -------------------- -------------
//------------- UnionAgents funcsion -------------
//------------- -------------------- -------------


//-------------*--------------------*-------------
//-------------- PastMatches table ---------------
//-------------*--------------------*-------------
