var express = require("express");
var router = express.Router();
const players_domain = require("./domains/players_domain");



router.get("/playerFullDetails/:playerID", async (req, res, next) => {
  try {
    const player_id = req.params.playerID;

    const playerFullDetails = await players_domain.extractRelevantPlayerData(player_id);

    res.status(200).send(playerFullDetails);
  } catch (error) {
    next(error);
  }

});

module.exports = router;