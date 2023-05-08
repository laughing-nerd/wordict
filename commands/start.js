const { ChannelType } = require('discord.js');
const mongoclient = require('../dbConnect.js');
const fetch = require('node-fetch')

module.exports = {
    name: "start",
    description: "This command initiates the game. Check out #wordict-game for more info",
    executeFunction: async (...args) => {
        const message = args[0];

        const findGuild = await mongoclient.db('wordict').collection('guilds').find({ _id: message.guild.id }).toArray();
        if (findGuild.length == 0) {
            let channel = message.guild.channels.cache.find(channel => channel.name=='wordict-game');
            if(channel == undefined)
            {
                channel = await message.guild.channels.create({
                    name: 'wordict-game',
                    type: ChannelType.GuildText,
                    topic: 'Wordict bot will send notifications in this channel'
                });
            }
            fetch('https://random-word-api.herokuapp.com/word?length=5')
            .then(response=>response.json())
            .then(async result=>{
                await mongoclient.db('wordict').collection('guilds').insertOne({
                    _id: message.member.guild.id,
                    name: message.member.guild.name,
                    word: result[0],
                    channelID: channel.id,
                    players: [],
                });
            });

        }
        else {
            message.channel.send("No need to start the game again. Your guild is already in it. Try to guess the word");
        }
        return message.guild.id;
    }
}