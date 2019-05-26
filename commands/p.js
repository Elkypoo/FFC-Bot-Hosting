const Discord = require("discord.js")
const fs = require("fs")
const client = new Discord.Client();
const scraper = require("google-search-scraper");

module.exports.run = (client, message, args) => {  









 
scraper.search({ query: args[0] + "tuition", limit: 1}, function(err, url, meta) {
  // This is called for each result
  if(err) throw err;
  message.channel.send(url);
  message.channel.send(meta.title);
  message.channel.send(meta.meta);
  message.channel.send(meta.desc)
});









}