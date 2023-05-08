const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "help",
    description: "This lists out all the commands available in Wordict",
    executeFunction: (...args)=>{
        const message = args[0]
        const commands = args[2]

        let list_of_commands = [];
        for (element of commands)
            list_of_commands.push({ name: "!"+element.name, value: element.description });


        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        const embed = new EmbedBuilder()
        
        embed.setColor(randomColor).setTitle("Commands for Wordict").addFields(list_of_commands)
        

        message.channel.send({ embeds: [embed] });
    }
}