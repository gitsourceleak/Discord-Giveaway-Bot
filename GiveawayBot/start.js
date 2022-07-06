const Discord = require("discord.js");
const yaml = require("js-yaml");
const fs = require("fs");
const ms = require("ms");
const botconfig = yaml.load(fs.readFileSync("./botconfig.yml", "utf8"));

exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission(botconfig.GiveawayPermission)) {
        return message.channel.send(
            `${message.author}, You need "\`${botconfig.GiveawayPermission}\`" permission to create a giveaway!`
        );
    }
    let embed = new Discord.MessageEmbed()
        .setTitle("Giveaway")
        .setDescription(
            "What channel do you want your giveaway to be in?\nYou can cancel the giveaway at any time by saying `cancel`."
        )
        .setColor(`GREEN`);

    message.channel.send(embed);
    await startMessageCollectors(bot, message, args);

    function startMessageCollectors(bot, message, args) {
        let channelFilter = m => m.author.id === message.author.id;
        let channelCollector = new Discord.MessageCollector(
            message.channel,
            channelFilter, {
                max: 999,
                time: 120000,
                errors: ["time"]
            }
        );

        channelCollector.on("collect", async msg => {
            let channel = await msg.mentions.channels.first();
            if (msg.content.toLowerCase() === "cancel") {
                msg.channel.send("The giveaway has been canceled.");
                channelCollector.stop();
                return;
            }
            if (!channel) {
                await msg.channel.send("That is not a valid channel!");
                return;
            } else {
                let embed = new Discord.MessageEmbed()
                    .setTitle("Giveaway")
                    .setDescription(
                        `Alright, How long do you want the giveaway to last?\nYou can cancel the giveaway at any time by saying \`cancel\`.`
                    )
                    .setColor(`GREEN`);
                msg.channel.send(embed);
                channelCollector.stop();
            }
            let durationFilter = m => m.author.id === message.author.id;
            let durationCollector = new Discord.MessageCollector(
                message.channel,
                durationFilter, {
                    max: 999,
                    time: 120000,
                    errors: ["time"]
                }
            );
            durationCollector.on("collect", async msg => {
                let duration = msg.content;
                if (msg.content.toLowerCase() === "cancel") {
                    msg.channel.send("The giveaway has been canceled.");
                    durationCollector.stop();
                    return;
                }
                if (!duration || isNaN(ms(duration))) {
                    return await msg.channel.send("You did use a valid time format!");

                } else {
                    let embed = new Discord.MessageEmbed()
                        .setTitle("Giveaway")
                        .setDescription(
                            `How much winners do you want the giveaway to have?\nThe maximum amount of winners you can have is 20. \nYou can cancel the giveaway at any time by saying \`cancel\`.`
                        )
                        .setColor(`GREEN`);
                    msg.channel.send(embed);
                    durationCollector.stop();
                }
                let winnersFilter = m => m.author.id === message.author.id;
                let winnersCollector = new Discord.MessageCollector(
                    message.channel,
                    winnersFilter, {
                        max: 999
                    }
                );
                winnersCollector.on("collect", async msg => {
                    let winners = msg.content;
                    let trueWinners = Math.round(winners);
                    if (msg.content.toLowerCase() === "cancel") {
                        msg.channel.send("The giveaway has been canceled.");
                        winnersCollector.stop();
                        return;
                    }
                    if (
                        isNaN(trueWinners) ||
                        (parseInt(trueWinners) <= 0 || trueWinners > 20)
                    ) {
                        return await msg.channel.send(
                            "You didn't provide a valid amount of winners!"
                        );

                    } else {
                        let embed = new Discord.MessageEmbed()
                            .setTitle("Giveaway")
                            .setDescription(
                                `Now, what do you want the prize to be? \nYou can cancel the giveaway at any time by saying \`cancel\`.`
                            )
                            .setColor(`GREEN`);
                        msg.channel.send(embed);
                        winnersCollector.stop();
                    }
                    let prizeFilter = m => m.author.id === message.author.id;
                    let prizeCollector = new Discord.MessageCollector(
                        message.channel,
                        prizeFilter, {
                            max: 99,
                            time: 120000,
                            errors: ["time"]
                        }
                    );
                    prizeCollector.on("collect", async msg => {
                        let prize = msg.content;
                        if (msg.content.toLowerCase() === "cancel") {
                            msg.channel.send("The giveaway has been canceled.");
                            prizeCollector.stop();
                            return;
                        } else if (!prize) {
                            await msg.channel.send(`You didn't specify a prize!`);
                            return;
                        } else {
                            let embed = new Discord.MessageEmbed()
                                .setTitle("Giveaway")
                                .setDescription(
                                    `The giveaway has been created in ${channel.toString()}.`
                                )
                                .setColor(`GREEN`);
                            msg.channel.send(embed);
                            prizeCollector.stop();
                            let success = new Discord.MessageEmbed()
                                .setDescription(botconfig.GiveawayStarted)
                                .setColor(`GREEN`);
                            msg.channel.send(success).then(msg => {
                                bot.giveawaysManager.start(channel, {
                                    time: ms(duration),
                                    prize: prize,
                                    lastChance: {
                                        enabled: botconfig.lastChanceEnabled,
                                        content: botconfig.content,
                                        threshold: botconfig.threshold,
                                        embedColor: botconfig.embedColor
                                    },
                                    bonusEntries: [{
                                        bonus: new Function('member', `return member.roles.cache.get(${botconfig.bonusEntriesRoleID}) ? ${botconfig.roleBonusEntries} : null`),
                                        cumulative: false
                                    }],
                                    winnerCount: trueWinners,
                                    hostedBy: message.author,
                                    messages: {
                                        giveaway: botconfig.giveaway,
                                        giveawayEnded: botconfig.giveawayEnded,
                                        timeRemaining: botconfig.timeRemaining,
                                        inviteToParticipate: botconfig.inviteToParticipate,
                                        winMessage: botconfig.winMessage,
                                        embedFooter: botconfig.embedFooter,
                                        noWinner: botconfig.noWinner,
                                        hostedBy: botconfig.hostedBy,
                                        winners: botconfig.winners,
                                        endedAt: botconfig.endedAt,
                                        units: {
                                            seconds: botconfig.seconds,
                                            minutes: botconfig.minutes,
                                            hours: botconfig.hours,
                                            days: botconfig.days,
                                        }
                                    }
                                })
                            });
                        }
                    });

                });

            });

        });

    }
};

exports.help = {
    name: botconfig.Start
};