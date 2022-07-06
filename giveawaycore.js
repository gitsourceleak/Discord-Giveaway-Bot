const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');
const botconfig = yaml.load(fs.readFileSync('./botconfig.yml', 'utf8'));
const Giveaway = require("discord-giveaways");
const ascii = require("ascii-table");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const manager = new Giveaway.GiveawaysManager(bot, {
    storage: "./giveaways.json",
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        embedColor: botconfig.GiveawayEmbedColor,
        embedColorEnd: botconfig.GiveawayEmbedColorEnd,
        reaction: botconfig.Reaction,
    },
});

bot.giveawaysManager = manager;

var table = new ascii("Commands");
table.setHeading("Commands", "Load status");

fs.readdir("./commands", (err, files) => {

    if (err) console.log(err);

    let cmdfile = files.filter(f => f.split(".").pop() === "js")

    cmdfile.forEach(f => {
        let props = require(`./commands/${f}`);

        if (props) {
            bot.commands.set(props.help.name, props);
            table.addRow(f, '✅');
        } else {
            table.addRow(f, `❌  -> missing a help.name, or help.name is not a string.`);
        }
    });

    console.log(table.toString());

});


bot.on("ready", async () => {

    bot.user.setActivity(botconfig.GameName, {
        type: botconfig.Status
    });

    const url = await bot.generateInvite({
  permissions: ['ADMINISTRATOR'],
});
    
    console.log(`=+================+= ${botconfig.BotName} =+================+=`);
    console.log(`${botconfig.BotName} is now connected to discord!`);
    console.log(`Any problems? Please contact me on discord/mc-market`);
    console.log(`Invite Link ${url}`);
    console.log(`This bot is created and founded by Ech`);
    console.log(`=+================+= ${botconfig.BotName} =+================+=`);

});

bot.on("message", async message => {

    if (message.author.bot) return;
    if (message.content.indexOf(botconfig.Prefix) !== 0) return;

    const args = message.content.slice(botconfig.Prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = bot.commands.get(command);

    if (!cmd) return;
    cmd.run(bot, message, args);

});

bot.login(botconfig.Token);