const axios = require("axios");
const LEAGUE_ID = 271;
const DButils = require("./DButils");


//* ------------------------------ getLeagueDetails ------------------------------ *//

async function getLeagueDetails() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  // const stage = await axios.get(
  //   `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
  //   {
  //     params: {
  //       api_token: process.env.api_token,
  //     },
  //   }
  // );
  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    // current_stage_name: stage.data.data.name,
    first_next_match: null
    };
}
exports.getLeagueDetails = getLeagueDetails;


//* ------------------------------ checkTeamName ------------------------------ *//

async function checkTeamNames(localTeamName, visitorTeamName) {
  const season_ID = await getCurrentSeasonID();
  const teams = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/teams/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  if (teams.data.data.find((x) => x.name == localTeamName) && teams.data.data.find((y) => y.name == visitorTeamName)) {
    return true;
  }
  return false;
}
exports.checkTeamNames = checkTeamNames;


//* ------------------------------ checkTeamName ------------------------------ *//

async function checkVenueName(venueName) {
  const season_ID = await getCurrentSeasonID();
  const venues = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/venues/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  if (venues.data.data.find((x) => x.name == venueName)) {
    return true;
  }
  return false;
}
exports.checkVenueName = checkVenueName;


//* ------------------------------ get Venues Names ------------------------------ *//

async function getVenuesNames() {
  const season_ID = await getCurrentSeasonID();
  const venues = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/venues/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return venues.data.data.map((element) => {
    return {
      venueName : element.name
    }
  });
  
}
exports.getVenuesNames = getVenuesNames;


//* ------------------------------ get Teams Names ------------------------------ *//


async function getTeamsNames() {
  const season_ID = await getCurrentSeasonID();
  const teams = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/teams/season/${season_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return teams.data.data.map((element) => {
    return {
      teamName : element.name
    }
  });
  
}
exports.getTeamsNames = getTeamsNames;




async function getCurrentSeasonID() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
    return league.data.data.current_season_id;
}

exports.getCurrentSeasonID = getCurrentSeasonID;