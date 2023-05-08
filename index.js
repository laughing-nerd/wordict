const fs = require('fs');
require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, EmbedBuilder, ActivityType } = require('discord.js');
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const mongoclient = require('./dbConnect.js');


let guild_id_list = []
const PREFIX = '!'; //Bot prefix
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

//Command loader
let commands = []
fs.readdirSync('./commands').filter((file) => {
    if (file.endsWith('.js')) {
        let req = require(`./commands/${file}`);
        commands.push(req);
    }
});

//Client events
client.on('ready', async() => {
    console.log("Bot is online!");
    client.user.setActivity({
        name: `${PREFIX}help`,
        type: ActivityType.Listening
    });

    //Fills up guilds_id_list when the bot is ready
    const guilds = await mongoclient.db('wordict').collection('guilds').find({}).toArray();
    for(let i=0;i<guilds.length;i++)
        guild_id_list.push(guilds[i]._id);

    //Word schedule
    schedule.scheduleJob('0 0 * * *', async()=>{
        for(let i=0;i<guild_id_list.length; i++)
        {
            const guild_required = await mongoclient.db('wordict').collection('guilds').find({ _id:guild_id_list[i] }).toArray();
            const channel = client.channels.cache.get(guild_required[0].channelID); //Channel to post

            //Fetch a new word
            fetch('https://random-word-api.herokuapp.com/word?length=5')
            .then(response=>response.json())
            .then(async result=>{
                let players = guild_required[0].players;
                if(players.length!=0)
                {
                    for(let j=0;j<players.length;j++)
                    {
                        players[j].chances = 5;
                        players[j].status = true;
                    }
                }
                await mongoclient.db('wordict').collection('guilds').updateOne({ _id:guild_id_list[i] }, {$set: {word: result[0], players: players}});
            });
            channel.send("||@everyone||\n:loudspeaker:New word is available now! Put on your thinking caps and start guessing the word");
        }
    });
});

client.on('guildCreate', async (guild) => {
    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle("Here are some rules before you start playing around with Wordict")
        .setDescription(`
        :pencil: After the bot is added to a server, the game won't start immediately. Someone has to use the ${PREFIX}start command to initiate the game. To know about the start command, type ${PREFIX}help in the chat.

        :pencil: Every user will get 5 chances to guess the 5 letter word.

        :pencil: New words will be available every 24 hours.

        :pencil: Players who guess the correct word will receive points based on the number of attempts they made and how close their guess was to the correct word.

        **Let the bot-bonding adventure begin - it's time to play and win!**
        ||@everyone||
        `);

    let channelPresent = false
    guild.channels.cache.find(channel => {
        if (channel.name == 'wordict-game') {
            channelPresent = true;
            channel.send({ embeds:[embed] });
        }
    });
    if (!channelPresent) {
        channel = await guild.channels.create({
            name: 'wordict-game',
            type: ChannelType.GuildText,
            topic: 'Wordict bot will send notifications in this channel'
        });
        channel.send({ embeds:[embed] });
    }
});

client.on('guildDelete', async (guild) => {
    try {
        await mongoclient.db('wordict').collection('guilds').deleteOne({ _id: guild.id });
        let index = guild_id_list.indexOf(guild.id);
        guild_id_list.splice(index, 1);
    }
    catch (e) {
        console.log(e);
    }
});

client.on('messageCreate', async (message) => {
    if (!message.author.bot && message.content.startsWith(PREFIX)) {

        let msg = message.content.toLowerCase();
        let [command, argument] = msg.split(' ');
        for (element of commands) {
            if (element.name === command.substring(PREFIX.length))
            {
                const val = await element.executeFunction(message, argument, commands); //'commands' argument is only for help.js (Needs to be changed)
                if(val!=undefined)
                    guild_id_list.push(val);
            }
        }
    }
});
client.login(process.env.BOT_TOKEN);