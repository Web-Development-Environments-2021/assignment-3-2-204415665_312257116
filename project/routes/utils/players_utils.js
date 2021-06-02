const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
// const TEAM_ID = "85";



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
/*-------------------------------------------------------------------------------------*/
async function getPlayerfullinfo(player_id) {
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
//* ------------------------------ extractRelevantPlayerData ------------------------------ *//

function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { fullname, image_path, position_id, common_name, nationality, birthdate, birthcountry, height, weight } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {playerShortInfo: {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    },
    commonName: common_name,
    nationality: nationality,
    birthDate: birthdate,
    birthCountry: birthcountry,
    height: height,
    weight: weight
  };
  });
}


//* ------------------------------ getPlayersByTeam ------------------------------ *//

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayerfullinfo = getPlayerfullinfo;
