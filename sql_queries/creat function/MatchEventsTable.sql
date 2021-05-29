
--------------- MatchEvents table ---------------
CREATE TABLE [dbo].[MatchEvents](
	[eventID] [int] NOT NULL UNIQUE,
	[eventTimeAndDate] [datetime] NOT NULL,
    [minuteInMatch] [time] NOT NULL,
    [eventType] nvarchar (255) NOT NULL CHECK (eventType IN('Goal', 'Red Card', 'Yellow Card', 'Injury', 'Subsitute','None')) DEFAULT 'None',
    [eventDescription] [text],
    [nextMatchEventID] [int]
)

