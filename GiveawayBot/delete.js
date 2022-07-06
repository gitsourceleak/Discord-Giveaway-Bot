const yaml = require('js-yaml');
const fs = require("fs");
const botconfig = yaml.load(fs.readFileSync('./botconfig.yml', 'utf8'));

exports.run = async (bot, message, args) => {

    if (!message.member.hasPermission(botconfig.GiveawayPermission)) {
        return message.channel.send(`You need "\`${botconfig.GiveawayPermission}\`" permission to create a giveaway!`);
    }

    if (!message.member.roles.cache.get(botconfig.GiveawayAdminRoleID)) {

        return message.channel.send(`${message.author}, You need "\`${message.guild.roles.cache.get(botconfig.GiveawayAdminRoleID).name}\`" role to create a giveaway!`);
    }

    if (!args[0]) {
        return message.channel.send(`${message.author}, You need to specify a valid message ID! `);
    }

    let giveaway =
        bot.giveawaysManager.giveaways.find((g) => g.prize === args.join(' ')) ||
        bot.giveawaysManager.giveaways.find((g) => g.messageID === args[0]);

    if (!giveaway) {
        return message.channel.send(`${message.author}, Unable to find a giveaway for ${args.join(' ')}.`);
    }

    bot.giveawaysManager.delete(args[0]).then(() => {
        message.channel.send(`Success! Giveaway has been deleted!`);
    }).catch((err) => {
        message.channel.send(`${message.author}, No giveaway found for ${args[0]}, please check and try again`);
    });
};

exports.help = {
    name: botconfig.Delete
}