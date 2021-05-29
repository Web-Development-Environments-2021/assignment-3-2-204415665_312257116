const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getMatchsInfo ------------------------------ *//

async function getMatchsInfo(match_ids_array) {
    let promises = [];
    match_ids_array.map((id) =>
      promises.push(
        axios.get(`${api_domain}/fixtures/${id}`, {
          params: {
            api_token: process.env.api_token,
            includes: localTeam, visitorTeam, venue,
          },
        })
      )
    ); 
    let matchs_info = await Promise.all(promises);
    return extractRelevantMatchsData(matchs_info);
  }
  //* ------------------------------ extractRelevantPlayerData ------------------------------ *//

function extractRelevantMatchsData(matchs_info) {
    return matchs_info.map((curr_match_info) => {
      const { homeTeamName } = curr_match_info.data.localTeam.data.name;
      const { awayTeamName } = curr_match_info.data.visitorTeam.data.name;
      const {gameDate} = curr_match_info.data.time;
      const { stadium } = curr_match_info.data.venue.data.name;
      return {
        matchDate: gameDate,
        loaclTeamName: homeTeamName,
        visitorTeamName: awayTeamName,
        venueName: stadium,
      };
    });
  }
  
  exports.getMatchsInfo = getMatchsInfo;
