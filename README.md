# Discord Music Bot

## Commands

All commands are registered with the discord api and are prefixed with `/` as like running any command on discord.

## Working with the Bot

### Running it

1. Install Node
2. Rename `.env.template` to `.env` and fill in the information within the file. 
3. Run `npm install` within the project folder.
4. Run `npm start` to start the bot.

### How commands work

- The file name for the command should be the name for how the command is executed  

- All commands implement the Command interface which can be found at `src/bot/utils/models/command.ts`.

- Once a new command is created, on restart of the bot, the command will automatically be picked up.
