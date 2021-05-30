//init
const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const matches_utils = require("./matches_utils");


//------------------------------------------------------------------------------------ //
// -----------------------------   SQL_searchByQuery   ------------------------------- //
//------------------------------------------------------------------------------------ //

function SQL_searchByQuery(Search_Query, Search_Type, Sort_Teams_Alphabetical, Sort_Players, Sort_Players_By, Filter_Players) {
    const Qsearch = getQueryInfo(Search_Query, Search_Type);
    return Qsearch;
}
exports.SQL_searchByQuery = SQL_searchByQuery;


// //* ------------------------------ getMatchesInfo ------------------------------ *//

async function getQueryInfo(Search_Query, Search_Type) {

  let promises = [];
  var include_params;

  if (Search_Type == "Teams"){  //A switch that differentiates between teams and players
    Search_Type="teams"
    // include_params = `squad.player , league`;
  }
  else{
    Search_Type="players"
    include_params = `team`;
  }

  promises.push(
        axios.get(`${api_domain}/${Search_Type}/search/${Search_Query}`, {
        params: {
          api_token: process.env.api_token,
          include: `${include_params}`,
        },
      })
  ) 
  let Query_info = await Promise.all(promises);
  return extractRelevantQueryInfo(Query_info, Search_Type);
}


//* ---------------------------- extractRelevantPlayerData ---------------------------- *//

function extractRelevantQueryInfo(Query_info, Search_Type) {

  return Query_info.map((curr_item) => {
    if (Search_Type == "teams"){
      const { name } = curr_item.data.data[0];
      const { logo_path } = curr_item.data.data[0];
      return {
        teamName: name,
        teamLogo: logo_path,
      };
    }
    else{
      const { teamName } = Query_info.data.data["name"];
      return {
        name: date_time,
        image: homeTeamName,
        position: awayTeamName,
        team_name: stadium,
      };
    }

  });
}
exports.getQueryInfo = getQueryInfo;




// --------------------   get  user Favorites Matches   ---------------------------- //

async function getFavoriteMatches(user_id) {
  const match_ids = await DButils.execQuery(
    `select match_id from FavoriteMatches where user_id='${user_id}'`
  );
  return match_ids;
}
exports.getFavoriteMatches = getFavoriteMatches;





// --------------------   Favorites Matched insert   ----------------------------//

// add a Matched to User Favorites Matches

async function markMatchesAsFavorite(user_id, match_id) {
  if (user_id && match_id)
   {            
      const userFavoriteMatches = await getFavoriteMatches(user_id);
      var flag = false;
      for (var i = 0 ; i < userFavoriteMatches.length ; i++){
        if (userFavoriteMatches[i].match_id == match_id){
          return flag;
        }
      }
      const checkMatch_exist = await matches_utils.getMatchByID(match_id);
      if (checkMatch_exist.length > 0) {
            DButils.execQuery(`insert into FavoriteMatches values ('${user_id}',${match_id})`);
            flag = true;
      }
    }  
  
  return flag;
}exports.markMatchesAsFavorite = markMatchesAsFavorite;


