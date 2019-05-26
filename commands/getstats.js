module.exports.run = (client, message, args, config, pugs, icons, Discord) => {
    const steam = require('steamidconvert')(config.steamapi);
    const SteamID = require('steamid');
    const fs = require('fs')
    const request = require('request');
    const jp = {
        query: function (obj, pathExpression) {
            return require('jsonpath-plus')({
                json: obj,
                path: pathExpression
            });
        }
    }

    var totalDpm = 0;
    var totalHeals = 0;
    var totalUbers = 0;
    var totalDrops = 0;
    var totalKills = 0;
    var totalDeaths = 0;
    var totalAssists = 0;
    var totalAirshots = 0;
    var healspread = 0;

    var dpmWorth = 0.6;
    var healsWorth = 0.05;
    var ubersWorth = 10;
    var dropsWorth = -25;
    var killsWorth = 8;
    var deathsWorth = -8;
    var assistsWorth = 3;
    var airshotsWorth = 6;
    var hoursWorth = 0.25;
    var altThreshold = 0.15;

    var score = 0;
    var finalScore = 0;
    var alt;
    var altProminence;
    var allFriends;
    var subjectFriends;

    function getSteamIDs(callback) {
        if (args[0] == "") {
            message.channel.send(`Error: You need to enter a link to your Steam profile after ${config.prefix}getstats (e.g. ${config.prefix}getstats https://steamcommunity.com/id/ElkYT)`)
        } else {
            if (args[0].toLowerCase().indexOf("steamcommunity.com/id".toLowerCase()) != -1) {
                if (args[0].slice(-1) == "/") {
                    customid = args[0].slice((args[0].indexOf("d")) + 2, args[0].lastIndexOf(args[0].slice(-1)))
                } else {
                    customid = `${args[0].slice((args[0].indexOf("d")) + 2, args[0].lastIndexOf(args[0].slice(-1)))}${args[0].slice(-1)}`
                }
                steam.convertVanity(customid, function (err, res) {
                    if (err) {
                        message.channel.send(`Error: Couldn't grab SID64 from Steam profile (Contact an Admin)`);
                        console.log(err)
                    } else {
                        steamid64 = res
                        sid64 = steamid64
                        sid3 = (new SteamID(sid64)).steam3();
                        callback(sid64, sid3)
                    }
                })
            } else if (args[0].toLowerCase().indexOf("steamcommunity.com/profiles".toLowerCase()) != -1) {
                if (args[0].slice(-1) == "/") {
                    steamid64 = args[0].slice((args[0].indexOf("l")) + 4, args[0].lastIndexOf(args[0].slice(-1)))
                    sid64 = steamid64
                    sid3 = (new SteamID(sid64)).steam3();
                    callback(sid64, sid3)
                } else {
                    steamid64 = `${args[0].slice((args[0].indexOf("l")) + 4, args[0].lastIndexOf(args[0].slice(-1)))}${args[0].slice(-1)}`
                    sid64 = steamid64
                    sid3 = (new SteamID(sid64)).steam3();
                    callback(sid64, sid3)
                }
            } else if (args[0].length == 17 && /^\d+$/.test(args[0])) {
                message.channel.send(`Read '**${args[0]}**' as SteamID64...`)
                steamid64 = args[0]
                sid64 = steamid64
                sid3 = (new SteamID(sid64)).steam3();
                callback(sid64, sid3)
            } else {
                message.channel.send(`Read '**${args[0]}**' as Vanity URL...`)
                customid = args[0]
                steam.convertVanity(customid, function (err, res) {
                    if (err) {
                        message.channel.send(`Error: Couldn't find Steam Profile. Check your command.`);
                        console.log(err)
                    } else {
                        steamid64 = res
                        sid64 = steamid64
                        sid3 = (new SteamID(sid64)).steam3();
                        callback(sid64, sid3)
                    }
                })
            }
        }
    }

    function combineIntoScore(callback2) {
        console.log(`made it here!`)
        var score = (Math.round((totalDpm * dpmWorth) + (totalUbers * ubersWorth) + (totalHeals * healsWorth) + (totalDrops * dropsWorth) + (totalKills * killsWorth) + (totalDeaths * deathsWorth) + (totalAssists * assistsWorth) + (totalAirshots * airshotsWorth)) / logIds.length)
        callback2(score)
        if (score < 201) {
            request(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=89E824D992EAA795D50D51D14DEE8904&steamid=${sid64}&relationship=friend`, function (error, response, body) {
                body = JSON.parse(body)
                var subjectFriends = (jp.query(body.friendslist.friends, `$..*.steamid`))
                var i2 = subjectFriends.length
                var k2 = 0
                if (i2 > 0) {
                    console.log(`This user has ${i2} friend(s).`)
                    do {
                        i2--;
                        request(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=89E824D992EAA795D50D51D14DEE8904&steamid=${subjectFriends[i2]}&relationship=friend`, function (error, response, body2) {
                            body2 = JSON.parse(body2)
                            if (body2.friendslist) {
                                var subFriend = {};
                                subFriend[subjectFriends[i2]] = (jp.query(body2.friendslist.friends, `$..*.steamid`))
                                if (!allFriends) {
                                    allFriends = subFriend[subjectFriends[i2]]
                                } else {
                                    allFriends = allFriends + subFriend[subjectFriends[i2]]
                                }
                            }
                            k2++
                            if (k2 == subjectFriends.length) {
                                array = allFriends.split(",")

                                var index = array.indexOf(sid64);
                                do {
                                    array.splice(index, 1);
                                    var index = array.indexOf(sid64);
                                } while (index != -1)

                                console.log(array.indexOf(sid64))
                                if (array.length == 0)
                                    return null;
                                var modeMap = {};
                                var maxEl = array[0], maxCount = 1;
                                for (var i = 0; i < array.length; i++) {
                                    var el = array[i];
                                    if (modeMap[el] == null)
                                        modeMap[el] = 1;
                                    else
                                        modeMap[el]++;
                                    if (modeMap[el] > maxCount) {
                                        maxEl = el;
                                        maxCount = modeMap[el];
                                    }
                                }
                                alt = maxEl
                                altProminence = maxCount
                                console.log(maxEl)
                                if (altProminence / subjectFriends.length >= altThreshold) {
                                    var embed = new Discord.RichEmbed()
                                        .setTitle(`**Your account is under suspicion of being an alt!**`)
                                        .setColor("#F95454")
                                        .setDescription(`This doesn't really mean anything other than that the Staff will investigate further. There's no need to worry.`)
                                        .addField("Suspected Main",
                                            `**http://steamcommunity.com/profiles/${alt}**\n-`)

                                        .addField("Possibilty of Alt",
                                            `**${(Math.round((altProminence / subjectFriends.length) * 1000)) / 10}%**`)

                                    message.channel.send(`{this message will later mention staff}`, {
                                        embed
                                    });
                                }
                            }
                        });
                    }
                    while (i2 > 0)
                }
            });
        }
    }

    if (args[0]) {
        getSteamIDs(function (sid64, sid3) {

            console.log(`Got SID64 (${sid64}) and SID3 (${sid3})`)

            var steam = require('steam-community'),
                client = steam();

            request(`http://logs.tf/json_search?&player=${sid64}&limit=20`, function (error, response, body) {
                if (error) {
                    console.log(`Logs.TF Log-Fetching Error: ${error}`)
                }
                console.log(`Response request: ${response && response.statusCode}`)
                var json = JSON.parse(body)
                logIds = jp.query(json.logs, '$..id');
                console.log(`Got LogIDs: ${logIds.join(', ')}`)
                var i = logIds.length
                var k = 0
                if (i > 0) {
                    console.log(`This user has ${i} log(s).`)
                    do {
                        i--;
                        console.log(`Reading log #${Number([i]) + 1}`)
                        request(`http://logs.tf/json/${logIds[i]}`, function (error, response, body) {
                            var json2 = JSON.parse(body)
                            totalDpm += Math.round(Number(jp.query(json2.players[`${sid3}`], `$..dapm`)))
                            totalHeals += Math.round(Number(jp.query(json2.players[`${sid3}`], `$..heal`)))
                            totalUbers += Math.round(Number(jp.query(json2.players[`${sid3}`], `$..ubers`)))
                            totalDrops += Math.round(Number(jp.query(json2.players[`${sid3}`], `$..drops`)))
                            totalKills += Math.round(Number(json2.players[`${sid3}`].kills))
                            totalDeaths += Math.round(Number(json2.players[`${sid3}`].deaths))
                            totalAssists += Math.round(Number(json2.players[`${sid3}`].assists))
                            totalAirshots += Math.round(Number(json2.players[`${sid3}`].as))
                            k++
                            if (k == logIds.length) {
                                combineIntoScore(function (score) {
                                    finalScore = Math.round(score)
                                    console.log(finalScore)
                                    fs.readFile('scores.json', 'utf8', function readFileCallback(err, data) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            obj = JSON.parse(data);
                                            console.log(`Score already exists: ${(jp.query(obj.scores, `$..${sid64}.score`))}`)
                                            console.log((jp.query(obj, `$.scores[0][*].id`)).indexOf(message.author.id))
                                            var embed = new Discord.RichEmbed()
                                                .setColor("#55A760")
                                                .setDescription(`These are stats from your ${logIds.length} most recent [logs](http://logs.tf/profile/${sid64})\n`)
                                                .setFooter("Make your hours public and do !getstats to get a skill rating.")
                                                .addField("-\nAverage DPM",
                                                    `**${totalDpm / logIds.length}**\nweighted at ${dpmWorth} each in !getstats\n-`)

                                                .addField("Average KDR (K/A/D)",
                                                    `**${((totalKills / logIds.length) / (totalDeaths / logIds.length)).toFixed(2)} (${totalKills / logIds.length}/${(totalAssists / 2) / logIds.length}/${totalDeaths / logIds.length})**\nweighted at ${killsWorth}/${assistsWorth}/${deathsWorth} each in !getstats\n-`)

                                                .addField("Average Healing",
                                                    `**${totalHeals / logIds.length}**\nweighted at ${healsWorth} each in !getstats\n-`)

                                                .addField("Average Drops",
                                                    `**${totalDrops / logIds.length}**\nweighted at ${dropsWorth} each in !getstats\n-`)

                                                .addField("Average Airshot Kills (Soldier and Demo)",
                                                    `**${totalAirshots / logIds.length}**\nweighted at ${airshotsWorth} each in !getstats\n-`)


                                            message.channel.send({
                                                embed
                                            });
                                            obj.scores.push({
                                                [sid64]: {
                                                    score: finalScore,
                                                    id: message.author.id
                                                }
                                            })
                                            json = JSON.stringify(obj);
                                            fs.writeFileSync('scores.json', json, 'utf8');

                                        }
                                    })

                                });
                            }
                        })
                    } while (i > 0)
                } else {
                    message.channel.send(`You have no logs! Play some PUGs and then come back to check your stats!`)
                }

            });
        })
    } else {
        message.channel.send(`You need to put a link to your steam profile *after* ${config.prefix}getstats (e.g. \`${config.prefix}getstats http://steamcommunity.com/id/elkyt\`)!`)
    }
}