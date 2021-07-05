--------------- Users table ---------------
-- CREATE TABLE [dbo].[Users](
-- 	[user_id] [int] IDENTITY(1,1) NOT NULL UNIQUE,
-- 	[username] [varchar](30) NOT NULL UNIQUE,
-- 	[password] [varchar](300) NOT NULL,
-- 	[firstname] [varchar](300) NOT NULL,
-- 	[lastname] [varchar](300) NOT NULL,
-- 	[country] [varchar](300) NOT NULL,
-- 	[email] [varchar](300) NOT NULL,
-- 	[image-url] [varchar](300) NOT NULL
-- )

--------------- FavoriteMatches table ---------------
CREATE TABLE [dbo].[FavoriteMatches](
	[user_id] [int] NOT NULL,
	[match_id] [int] NOT NULL
)
