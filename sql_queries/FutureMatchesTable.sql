--------------- FutureMatches table ---------------
CREATE TABLE [dbo].[FutureMatches](
	[match_id] [int] NOT NULL PRIMARY KEY,
	[matchDateAndTime] [datetime] NOT NULL,
	[localTeamName] [varchar](300) NOT NULL,
	[visitorTeamName] [varchar](300) NOT NULL,
	[venueName] [varchar](300) NOT NULL,
    [refereeID] [int] NOT NULL
)