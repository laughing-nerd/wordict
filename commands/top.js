const { EmbedBuilder } = require('discord.js');
const mongoclient = require('../dbConnect.js');

module.exports = {
    name: "top",
    description: "Displays the top 3 players in a particular server",
    executeFunction: async (...args) => {
        message = args[0];

        const guild_data = await mongoclient.db('wordict').collection('guilds').find({ _id: message.guild.id }).toArray();
        if (guild_data.length == 0)
            message.channel.send("This guild isn't registered yet. Use !start to register the guild");
        else {
            let players = guild_data[0].players;
            if (players.length > 0) {
                let i = 1;
                while (i < players.length) {
                    for (let j = i; j > 0; j--) {
                        if (players[j].score < players[j - 1].score) {
                            temp = players[j];
                            players[j] = players[j - 1];
                            players[j - 1] = temp;
                        }
                    }
                    i = i + 1;
                }
                const randomColor = Math.floor(Math.random() * 16777215).toString(16);
                const embed = new EmbedBuilder()
                    .setColor(randomColor)
                    .setTitle(`Top 5 players in ${message.guild.name}`)
                    .setDescription(`\n
            :first_place: ${players[0].name} [**${players[0].score} POINTS**]\n
            :second_place: ${players[1].name} [**${players[1].score} POINTS**]\n
            :third_place: ${players[2].name} [**${players[2].score} POINTS**]\n
            `);
                message.channel.send({ embeds: [embed] });


            }
            else
                message.channel.send("No players have participated yet :(");
        }
    }
}