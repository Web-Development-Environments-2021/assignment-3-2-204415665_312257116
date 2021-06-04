const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


/*------------------------------- getTeamFullInfo -----------------------------------*/

async function getTeamFullInfo(team_id) {
    let promises = [];
      promises.push(
        axios.get(`${api_domain}/teams/${team_id}`, {
          params: {
            api_token: process.env.api_token,
            include: "squad.player",
          },
        })
      );
    let team_info = await Promise.all(promises);
    return team_info;
}
exports.getTeamFullInfo = getTeamFullInfo;
  
