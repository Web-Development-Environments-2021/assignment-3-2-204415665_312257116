
const players_utils = require("../utils/players_utils");



//* ------------------------------ extractRelevantPlayerData ------------------------------ *//

async function extractRelevantPlayerData(player_id) {

  var players_info = await players_utils.getPlayerFullInfo(player_id);

    return players_info.map((player_info) => {
      const { player_id, fullname, image_path, position_id, common_name, nationality, birthdate, birthcountry, height, weight } = player_info.data.data;
      const { name } = player_info.data.data.team.data;
      return {playerShortInfo: {
        playerID: player_id,
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
  
