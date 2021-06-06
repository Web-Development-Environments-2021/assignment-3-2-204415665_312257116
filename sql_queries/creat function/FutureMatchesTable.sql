--------------- FutureMatches table ---------------
CREATE TABLE [dbo].[FutureMatches](
	[match_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
	[matchDateAndTime] [datetime] NOT NULL,
	[localTeamName] [varchar](300) NOT NULL,
	[visitorTeamName] [varchar](300) NOT NULL,
	[venueName] [varchar](300) NOT NULL,
    [refereeID] [int]
)