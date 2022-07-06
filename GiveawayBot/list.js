const yaml = require('js-yaml');
const fs = require("fs");
const ms = require("ms");
const { MessageEmbed } = require("discord.js")
const botconfig = yaml.load(fs.readFileSync('./botconfig.yml', 'utf8'));

exports.run = async (bot, message, args) => {
    let notEnded = bot.giveawaysManager.giveaways.filter((g) => !g.ended);
    
    let txt = '';

    notEnded.forEach(async (giveaway, index) => {
        
        txt += `> \`Prize\` » **${giveaway.prize}** | \`Time Remaining\` » **${ms(giveaway.endAt - Date.now())}**\n\n`;
        
    })
    
    let embed = new MessageEmbed()
        .setTitle("Giveaways")
        .setDescription(`**Here is the list of active giveaways:** \n\n${txt}`)
        .setColor(`GREEN`);

        await message.channel.send(embed);
}
exports.help = {
    name: botconfig.ListGiveaways
}