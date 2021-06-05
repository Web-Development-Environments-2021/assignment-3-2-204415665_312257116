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
  

/*------------------------------- getTeamIDByName -----------------------------------*/

async function getTeamIDByName(teamName) {
  let url = encodeURI(`https://soccer.sportmonks.com/api/v2.0/teams/search/${teamName}`);
  const team = await axios.get(url,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  if (team.data.data.length == 0){
    return undefined;
  }
  const teamID = team.data.data[0].id;
  return teamID;
}
exports.getTeamIDByName = getTeamIDByName;