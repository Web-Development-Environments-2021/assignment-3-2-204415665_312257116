const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


//* ------------------------------ getMatchesInfo ------------------------------ *//

async function getMatchesInfo(match_ids_array) {
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
    let matches_info = await Promise.all(promises);
    return extractRelevantMatchesData(matches_info);
  }

//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantMatchesData(matches_info) {
    return matches_info.map((curr_match_info) => {
      var homeTeamName = curr_match_info.data.data.localTeam.data["name"];
      var awayTeamName = curr_match_info.data.data.visitorTeam.data["name"];
      const { date_time } = curr_match_info.data.data.time.starting_at;
      var stadium = curr_match_info.data.data.venue.data["name"];
      return {
        matchDate: date_time,
        localTeamName: homeTeamName,
        visitorTeamName: awayTeamName,
        venueName: stadium,
      };
    });
  }
  
  exports.getMatchesInfo = getMatchesInfo;
