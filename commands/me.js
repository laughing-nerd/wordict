const { EmbedBuilder } = require('discord.js');
const mongoclient = require('../dbConnect.js');

module.exports = {
    name: "me",
    description: "Shows the current user's score and position",
    executeFunction: async(...args)=>{
        const message = args[0];

        const guild_data = await mongoclient.db('wordict').collection('guilds').find({ _id: message.guild.id }).toArray();
        if(guild_data.length==0)
            message.channel.send("This guild is not registered yet. Use !start to register");
        else
        {
            const search_map = new Map();
            let players = guild_data[0].players;
            let i = 1;
            while (i < players.length) {
                for (let j = i; j > 0; j--) {
                    if (players[j].score > players[j - 1].score) {
                        let temp = players[j];
                        players[j] = players[j - 1];
                        players[j - 1] = temp;
                    }
                }
                i = i + 1;
            }
            for(let i=0;i<players.length;i++)
                search_map.set(players[i].id, i);
            
            const position = search_map.get(message.author.id);
            if(position==undefined)
                message.reply("You are not a registered player. Do !guess <word> to register yourself");
            else
            {
                const randomColor = Math.floor(Math.random() * 16777215).toString(16);
                const embed = new EmbedBuilder().setTitle(`${message.author.username}#${message.author.discriminator}`)
                .setColor(randomColor)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}`)
                .setDescription(`Position: ${position+1}\nPoints: ${players[position].score}`);
                message.channel.send({ embeds: [embed] });
            }
            
        }
    }
}