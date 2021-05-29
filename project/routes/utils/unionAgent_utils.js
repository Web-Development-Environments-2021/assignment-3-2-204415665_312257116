const DButils = require("./DButils");



//* ------------------------------ Add New Match ------------------------------ *//

async function addNewMatch(matchDate, loaclTeamName, visitorTeamName, venueName) {
    await DButils.execQuery(
      `insert into FeatureMatches values ('${matchDate}',${loaclTeamName},${visitorTeamName},${venueName})`
    );
  }
  exports.addNewMatch = addNewMatch;