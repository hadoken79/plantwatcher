const telegraf = require("telegraf");
const dbService = require('./dbService');
const fetch = require('node-fetch');
require("dotenv").config();


//const regex = /\w*pflanze\w*/i;
//let bot;
// //middleware
// bot.use(async (ctx, next) => {
//   const start = new Date();
//   await next();
//   const ms = new Date() - start;
//   console.log("Response time: %sms", ms);
// });

let bot;
let chatId;


if (!bot) {
    console.log("no bot till now");
    bot = new telegraf(process.env.BOT_TOKEN);
} else {
    console.log("there is a bot");
}



let t = 0;

bot.start((ctx) => {
    chatId = ctx.chat.id;
    ctx.reply(`Hallo ${ctx.message.from.first_name} kann ich dir helfen?`);
});

bot.help((ctx) => ctx.reply('Frag mich nach den Pflanzen, ich weiss Bescheid.'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.catch((err, ctx) => console.log(`Ooops, encountered an error for ${ctx.updateType}`, err));

bot.on('message', (ctx) => {


    if (ctx.message.text) {
        if (ctx.message.text.match(/[planzen][giessen]/i)) {
            console.log('match');
            console.log(ctx.message.text);
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
                                return ctx.reply(`${plant.name}: ${readings[0].hum}\n`)
                            })
                    });

                })
                .catch(err => {
                    return ctx.reply(`Die Datenbank antwortet nicht, da ist was faul.\n du musst für mich mal nachschauen.\n hier die Meldung: ${err.message}`);
                })


        } else {
            console.log(ctx.message.text);
            t++
            if (t == 1) return ctx.reply(`ich weiss nicht, wie ich es dir noch erklären kann...\n FRAG NACH DEINEN PFLANZEN!`);
            if (t == 2) return ctx.reply(`bist du dumm?`);
            if (t > 2) return ctx.reply(`geh weg!`);

            return ctx.reply(`du nuschelst so... \nWenn Du was zu deinen Pflanzen wissen willst, dann frag doch einfach.\n aber sprich deutlich.`);
        }
    } else {
        console.log(ctx.message);
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

    /* fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates`).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(body => {
        console.log(body);
    }) */

    bot.telegram.sendMessage(chatId, msg);

};


module.exports = {
    sendMsg
}