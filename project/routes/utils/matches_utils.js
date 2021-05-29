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
            include:`localTeam, visitorTeam, venue`,
          },
        })
      )
    ); 
    let matchs_info = await Promise.all(promises);
    return extractRelevantMatchsData(matchs_info);
  }

//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantMatchsData(matchs_info) {
    return matchs_info.map((curr_match_info) => {
      var homeTeamName = curr_match_info.data.data.localTeam.data["name"];
      var awayTeamName = curr_match_info.data.data.visitorTeam.data["name"];
      const { date_time } = curr_match_info.data.data.time.starting_at;
      var stadium = curr_match_info.data.data.venue.data["name"];
      return {
        matchDate: date_time,
        loaclTeamName: homeTeamName,
        visitorTeamName: awayTeamName,
        venueName: stadium,
      };
    });
  }
  
  exports.getMatchsInfo = getMatchsInfo;
