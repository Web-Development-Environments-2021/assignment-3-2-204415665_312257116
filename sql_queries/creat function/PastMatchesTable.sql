--------------- PastMatches table ---------------
CREATE TABLE [dbo].[PastMatches](
	[match_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
	[matchDateAndTime] [datetime] NOT NULL UNIQUE,
	[localTeamName] [varchar](300) NOT NULL,
	[visitorTeamName] [varchar](300) NOT NULL,
	[venueName] [varchar](300) NOT NULL,
    [refereeID] [int] ,
    [localTeamSocore] [int] NOT NULL,
    [visitorTeamScore] [int] NOT NULL,
    [firstEventID] [int] NOT NULL
)
