const mongoclient = require('../dbConnect.js');

module.exports = {
    name: "guess",
    description: "Use this command to guess the correct word. Format: !guess <word>. Replace <word> with your guess. You will get 5 chances to guess the correct word. New word will be available every 24 hours",
    executeFunction: async (...args)=>{
        let message = args[0]
        let argument = args[1]

        const guild_data = await mongoclient.db('wordict').collection('guilds').find({ _id:message.guild.id }).toArray();
        let players = guild_data[0].players
        if (guild_data.length == 0)
        {
            message.reply("Your guild is not registered. Do !start to register the guild and check out #wordict-game for more info");
        }
        else
        {
            let player_registered = false;
            let player_index = 0;
            for(let i=0;i<players.length;i++)
            {
                if (players[i].id == message.member.id)
                {
                    player_registered=true;
                    player_index=i;
                    break;
                }
            }
            if(player_registered)
            {
                if(players[player_index].chances==0)
                {
                    message.reply("You are out of chances. Try again later");
                }
                else
                {
                    if(guild_data[0].word == argument)
                    {
                        message.reply(":tada:Congratulations:tada: You guessed the word");
                        players[player_index].score = players[player_index]+((5-players[player_index].chances)*10);
                        players[player_index].chances = 0;
                        await mongoclient.db('wordict').collection('guilds').updateOne({_id: message.guild.id}, {$set: {players: players}});
                    }
                    else{
                        //If the proper word has not been guessed
                        let wrd='';
                        let arg = argument.substring(0,5);
                        let og_word = new Map();
                        for(let i=0;i<guild_data[0].word.length;i++)
                            og_word.set(guild_data[0].word[i], i);

                        //Hashmap search
                        for(let i=0;i<arg.length;i++)
                        {
                            let char_index = og_word.get(arg[i])
                            if(char_index == undefined)
                                wrd = wrd + ' \u001b[1;37m'+arg[i].toUpperCase();
                            else
                            {
                                if(char_index == i)
                                    wrd = wrd + ' \u001b[1;32m'+arg[i].toUpperCase();
                                else if (char_index != i)
                                    wrd = wrd + ' \u001b[1;33m'+arg[i].toUpperCase();
                            }
                                
                        }
                        wrd = '```ansi\n'+wrd+'\n```';
                        players[player_index].chances = players[player_index].chances - 1;
                        await mongoclient.db('wordict').collection('guilds').updateOne({_id: message.guild.id}, {$set: {players: players}});
                        message.reply(wrd+"\nChances left: "+players[player_index].chances);
                    }
                }
            }
            else
            {
                players.push({
                        id: message.author.id,
                        name: message.author.username,
                        score: 0,
                        chances: 5,
                        status: true
                    });
                await mongoclient.db('wordict').collection('guilds').updateOne({ _id:message.guild.id }, {$set: { players: players}});
                message.reply("It seems like you were not a registered player. Don't worry, i gotchu. I registered you and now you can guess the word. You have 5 chances to do so. Good luck :thumbsup:")
            }
        }
    }
}