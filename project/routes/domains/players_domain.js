
const players_utils = require("../utils/players_utils");



//* ------------------------------ extractRelevantPlayerData ------------------------------ *//

async function extractRelevantPlayerData(player_id) {

  var players_info = await players_utils.getPlayerFullInfo(player_id);

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
exports.extractRelevantPlayerData = extractRelevantPlayerData; 
  
  
// //* ------------------------------ getPlayersByTeam ------------------------------ *//
// TODO: what with this??
// async function getPlayersByTeam(team_id) {
//     let player_ids_list = await getPlayerIdsByTeam(team_id);
//     let players_info = await getPlayersInfo(player_ids_list);
//     return players_info;
// }
// exports.getPlayersByTeam = getPlayersByTeam;