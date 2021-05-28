--------------- Referee table ---------------
CREATE TABLE [dbo].[Referee](
	[referee_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
	[firstname] [varchar](300) NOT NULL,
	[lastname] [varchar](300) NOT NULL,
	[course] [varchar](30) NOT NULL CHECK ([course] IN('Regular', 'Main')) DEFAULT 'Regular'
)
