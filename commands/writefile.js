const Discord = require("discord.js")
const fs = require("fs")
const client = new Discord.Client();
const Enmap = require("enmap");

module.exports.run = (client, message, args) => {
    if (message.guild.member(message.member.id).hasPermission("ADMINISTRATOR")) {
        fs.writeFile(process.cwd() + "\\" + args[0], args[1]);
        message.channel.send(`Wrote file ${args[0]} successfully with content of "${args[1]}"!`)
    }
}