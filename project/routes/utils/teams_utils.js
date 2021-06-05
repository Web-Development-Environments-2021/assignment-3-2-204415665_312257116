const axios = require("axios");
const { NText } = require("mssql");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


/*------------------------------- getTeamFullInfo -----------------------------------*/

async function getTeamFullInfo(team_id) {
  try{
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
  }catch (error) {
    throw { status: 404, message: "teamId is not exists" };
  }

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
  const teamID = team.data.data[0]?.id;
  if (!teamID){
    throw { status: 404, message: "team name is not exists" };
  }
  return teamID;
  
  
}
exports.getTeamIDByName = getTeamIDByName;