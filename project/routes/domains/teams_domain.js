
const teams_utils = require("../utils/teams_utils");
const matches_utils = require("../utils/matches_utils");
const matches_domain = require("./matches_domain");
const league_utils = require("../utils/league_utils");



//* ------------------------------ extractRelevantTeamData ------------------------------ *//
  
async function extractRelevantTeamData(TeamID) {
  var CURRENT_SEASON_ID = await league_utils.getCurrentSeasonID();
  var team = await teams_utils.getTeamFullInfo(TeamID);
  
    return await Promise.all(team.map(async (team_info) => {

      const { id, name, short_code, logo_path, squad , current_season_id} = team_info?.data.data;

      if (CURRENT_SEASON_ID != current_season_id){
        return undefined; 
      }
      const squad_full_info = await getSquadInfo(squad.data,name);
      var pastMatches = await matches_domain.extractMatches_with_refereeInfo( await matches_utils.getPastMatchByTeamName(name) );

      for (var i = 0 ; i < pastMatches.length ; i++){
        var eventDic = await matches_utils.extractEventLog(pastMatches[i]["matchID"]);
        pastMatches[i]["eventsLog"] = eventDic[0];

      }
      
      var FutureMatches = await matches_domain.extractMatches_with_refereeInfo( await matches_utils.getFutureMatchByTeamName(name));
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
exports.extractRelevantTeamData = extractRelevantTeamData;


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


//* ------------------------------ get Team Details ByN ame ------------------------------ *//
  
async function getTeamDetailsByName(teamName){
    const teamID = await teams_utils.getTeamIDByName(teamName);
    if(!teamID){
      return undefined;
    }
  
    const team_details = await extractRelevantTeamData(teamID);
  
    return team_details;
}

exports.getTeamDetailsByName = getTeamDetailsByName;