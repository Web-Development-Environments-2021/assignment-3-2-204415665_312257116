const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getPlayerIdsByTeam ------------------------------ *//

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}
exports.getPlayerIdsByTeam = getPlayerIdsByTeam;


//* ------------------------------ getPlayersInfo ------------------------------ *//

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}
exports.getPlayersInfo = getPlayersInfo;


/*------------------------------- getPlayerFullInfo -----------------------------------*/

async function getPlayerFullInfo(player_id) {
  let promises = [];
    promises.push(
      axios.get(`${api_domain}/players/${player_id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}
exports.getPlayerFullInfo = getPlayerFullInfo;



