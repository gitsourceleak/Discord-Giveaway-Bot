const yaml = require('js-yaml');
const fs = require("fs");
const ms = require("ms");
const botconfig = yaml.load(fs.readFileSync('./botconfig.yml', 'utf8'));

exports.run = async (bot, message, args) => {

    if (!message.member.hasPermission(botconfig.GiveawayPermission)) {
        return message.channel.send(`${message.author}, You need "\`${botconfig.GiveawayPermission}\`" permission to create a giveaway!`);
    }

    if (!message.member.roles.cache.get(botconfig.GiveawayAdminRoleID)) {

        return message.channel.send(`${message.author}, You need "\`${message.guild.roles.cache.get(botconfig.GiveawayAdminRoleID).name}\`" role to create a giveaway!`);
    }

    let giveawayChannel = message.mentions.channels.first();
    if (!giveawayChannel) {
        return message.channel.send(`${message.author}, You need to mention a valid channel! \n\n\`Example usage: ${botconfig.Prefix}${botconfig.Create} <#channel-name> <duration> <number of winners> <prize>\``);
    }

    let giveawayDuration = args[1];
    if (!giveawayDuration || isNaN(ms(giveawayDuration))) {
        return message.channel.send(`${message.author}, You need to specify a valid duration! \n\n\`Example usage: ${botconfig.Prefix}${botconfig.Create} <#channel-name> <duration> <number of winners> <prize>\``);
    }

    let giveawayNumberWinners = Number(args[2]);
    if (isNaN(giveawayNumberWinners) || (parseInt(giveawayNumberWinners) <= 0)) {
        return message.channel.send(`${message.author}, You need to specify a valid number of winners! \n\n\`Example usage: ${botconfig.Prefix}${botconfig.Create} <#channel-name> <duration> <number of winners> <prize>\``);
    }

    let giveawayPrize = args.slice(3).join(' ');
    if (!giveawayPrize) {
        return message.channel.send(`${message.author}, You have to specify a valid prize! \n\n\`Example usage: ${botconfig.Prefix}${botconfig.Create} <#channel-name> <duration> <number of winners> <prize>\``);
    }

    bot.giveawaysManager.start(giveawayChannel, {
        time: ms(args[1]),
        prize: args.slice(3).join(" "),
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
        winnerCount: parseInt(args[2]),
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
};

exports.help = {
    name: botconfig.Create
}