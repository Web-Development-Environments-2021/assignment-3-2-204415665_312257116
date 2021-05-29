
--------------- Users table ---------------
CREATE TABLE [dbo].[Users](
	[user_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
	[username] [varchar](30) NOT NULL UNIQUE,
	[password] [varchar](300) NOT NULL,
	[firstname] [varchar](300) NOT NULL,
	[lastname] [varchar](300) NOT NULL,
	[country] [varchar](300) NOT NULL,
	[email] [varchar](300) NOT NULL,
	[image-url] [varchar](300) NOT NULL
)

--------------- UnionAgents table ---------------
CREATE TABLE [dbo].[UnionAgents](
	[agent_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
	[username] [varchar](30) NOT NULL UNIQUE,
	[password] [varchar](300) NOT NULL,
	[firstname] [varchar](300) NOT NULL,
	[lastname] [varchar](300) NOT NULL
)

--------------- Referee table ---------------
CREATE TABLE [dbo].[Referee](
	[referee_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
	[firstname] [varchar](300) NOT NULL,
	[lastname] [varchar](300) NOT NULL,
	[course] [varchar](30) NOT NULL CHECK ([course] IN('Regular', 'Main')) DEFAULT 'Regular'
)

-- --------------- FavoriteTeams table ---------------
-- CREATE TABLE [dbo].[FavoriteTeams](
-- 	[user_id] [int] NOT NULL,
-- 	[team_id] [int] NOT NULL
-- )

-- --------------- FavoritePlayers table ---------------
-- CREATE TABLE [dbo].[FavoritePlayers](
-- 	[user_id] [int] NOT NULL,
-- 	[player_id] [int] NOT NULL
-- )

--------------- FavoriteMatches table ---------------
CREATE TABLE [dbo].[FavoriteMatches](
	[user_id] [int] NOT NULL,
	[match_id] [int] NOT NULL
)

--------------- FutureMatches table ---------------
CREATE TABLE [dbo].[FutureMatches](
	[match_id] [int] NOT NULL PRIMARY KEY,
	[matchDateAndTime] [datetime] NOT NULL,
	[localTeamName] [varchar](300) NOT NULL,
	[visitorTeamName] [varchar](300) NOT NULL,
	[venueName] [varchar](300) NOT NULL,
    [refereeID] [int]  
)

--------------- PastMatches table ---------------
CREATE TABLE [dbo].[PastMatches](
	[match_id] [int] NOT NULL UNIQUE,
	[matchDateAndTime] [datetime] NOT NULL UNIQUE,
	[localTeamName] [varchar](300) NOT NULL,
	[visitorTeamName] [varchar](300) NOT NULL,
	[venueName] [varchar](300) NOT NULL,
    [refereeID] [int] ,
    [localTeamSocore] [int] NOT NULL,
    [visitorTeamScore] [int] NOT NULL,
    [firstEventID] [int] NOT NULL
)

--------------- MatchEvents table ---------------
CREATE TABLE [dbo].[MatchEvents](
	[eventID] [int] NOT NULL UNIQUE,
	[eventTimeAndDate] [datetime] NOT NULL,
    [minuteInMatch] [time] NOT NULL,
    [eventType] nvarchar (255) NOT NULL CHECK (eventType IN('Goal', 'Red Card', 'Yellow Card', 'Injury', 'Subsitute','None')) DEFAULT 'None',
    [eventDescription] [text],
    [nextMatchEventID] [int] 
)

