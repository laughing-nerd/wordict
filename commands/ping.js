module.exports = {
    name: "ping",
    description: "This simply replies with pong",
    executeFunction: (...args)=>{
        let message = args[0]

        message.channel.send('Pong')
    }
}