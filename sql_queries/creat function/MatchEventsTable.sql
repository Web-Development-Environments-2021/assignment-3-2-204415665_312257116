
--------------- MatchEvents table ---------------
CREATE TABLE [dbo].[MatchEvents](
	[eventID] [int] IDENTITY(1,1) NOT NULL UNIQUE,
    [matchID] [int] NOT NULL,
	[eventTimeAndDate] [datetime] NOT NULL,
    [minuteInMatch] [int] NOT NULL,
    [eventType] nvarchar (255) NOT NULL CHECK (eventType IN('Goal', 'Red Card', 'Yellow Card', 'Injury', 'Subsitute','None')) DEFAULT 'None',
    [eventDescription] [text]
    
)

