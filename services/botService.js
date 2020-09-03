const telegraf = require("telegraf"),
    dbService = require('./dbService'),
    { infoLog, warnLog } = require('./loggerService');
require("dotenv").config();




////middleware
// bot.use(async (ctx, next) => {
//   const start = new Date();
//   await next();
//   const ms = new Date() - start;
//   console.log("Response time: %sms", ms);
// });

let bot;
let chatId;
const regex = /\w*pflanzen\w*/i;


if (!bot) {
    bot = new telegraf(process.env.BOT_TOKEN); //ensure there aren't two instances of bot
}


let t = 0;

bot.start((ctx) => {
    chatId = ctx.chat.id;
    ctx.reply(`Hallo ${ctx.message.from.first_name} kann ich dir helfen?`);
});

bot.help((ctx) => ctx.reply('Frag mich nach den Pflanzen, ich weiss Bescheid.'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.catch((err, ctx) => {
    infoLog(`BOT-ERROR, ${ctx.updateType}, ${err}`);
    ctx.reply('Fehler in der Verarbeitung der Eingabe. Log-Eintrag wurde erstellt.');
});

bot.on('message', (ctx) => {

    if (ctx.message.text) {
        if (ctx.message.text.match(regex)) {

            //match
            t = 0;
            dbService.getPlants()
                .then(plants => {
                    if (plants.length < 1) {
                        return ctx.reply(`ich finde keine Pfalnzen in der Datenbank, \nhast du schon welche erfasst?`);
                    }
                    plants.forEach(plant => {
                        dbService.getPlantReadings(plant.plantId)
                            .then(readings => {
                                if (readings.length < 1) {
                                    return ctx.reply(`${plant.name}: noch keine Daten`);
                                }
                                return ctx.reply(`${plant.name}: ${readings[readings.length - 1].hum}\n`)
                            })
                    });

                })
                .catch(err => {
                    warnLog(`BOT-ERROR at asking db for plants ${err}`);
                    return ctx.reply(`Die Datenbank antwortet nicht, da ist was faul.\n du musst für mich mal nachschauen.\n hier die Meldung: ${err.message}`);
                })


        } else {
            t++
            console.log(ctx.message.text);

            if (t == 2) return ctx.reply(`ich weiss nicht, wie ich es dir noch erklären kann...\n FRAG NACH DEINEN PFLANZEN!`);
            if (t == 3) return ctx.reply(`bist du dumm?`);
            if (t > 3) return ctx.reply(`geh weg!`);

            return ctx.reply(`du nuschelst so... \nWenn Du was zu deinen Pflanzen wissen willst, dann frag doch einfach.\n aber sprich deutlich.`);
        }
    }
});




//extending funktionality
// bot2.context.db = {
//   getScores: (name) => {
//     return `42 ${name}`;
//   },
// };

// bot.hears(regex, (ctx) => {
//     const scores = ctx.db.getScores(ctx.message.from.first_name);
//     return ctx.reply(`${ctx.from.first_name}: ${scores}`);
// });

bot.launch();

const sendMsg = (msg) => {


    if (chatId) bot.telegram.sendMessage(chatId, msg).catch(err => warnLog(`BOT-ERROR ${err}`));

};


module.exports = {
    sendMsg
}