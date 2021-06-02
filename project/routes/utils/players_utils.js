const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
// const TEAM_ID = "85";
const matches_utils = require("./matches_utils");




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
  return extractRelevantPlayerData(team_info);
}
//* ------------------------------ extractRelevantTeamData ------------------------------ *//

async function extractRelevantTeamData(team) {
  return await Promise.all(team.map(async (team_info) => {
    const { id, name, short_code, logo_path, squad} = team_info.data.data;
    const squad_full_info = await getSquadInfo(squad.data,name);
    const FutureMatches = await matches_utils.getFutureMatchByTeamName(name);
    const pastMatches = await matches_utils.getPastMatchByTeamName(name);
    return {
      TeamID: id,
      teamLogo: logo_path,
      teamName: name,
      teamShortCode: short_code,
      teamSquad: squad_full_info,
      futureMatches: FutureMatches,
      pastMatches: pastMatches
    };
  }));
}
exports.getTeamFullInfo = getTeamFullInfo;

//* ------------------------------ getSquadInfo ------------------------------ *//

async function getSquadInfo(squad_info, team_name){
  return squad_info.map((player_info) => {
    const { player_id, position_id, fullname, image_path} = player_info.player.data;
    return {
      playerID: player_id,
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: team_name
    };
 });
}
exports.getSquadInfo = getSquadInfo;




exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayerFullInfo = getPlayerFullInfo;
