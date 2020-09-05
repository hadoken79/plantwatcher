const https = require('https');
const { infoLog, warnLog } = require('./loggerService');




const getWeatherData = () => {
    return new Promise((resolve, reject) => {
        https.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${process.env.WEATHER_POS_LAT}&lon=${process.env.WEATHER_POS_LON}&exclude=current,minutely,hourly&appid=${process.env.WEATHER_API_KEY}`, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {


                let raw = JSON.parse(data);
                console.log(raw.daily);

                resolve();
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    })


}
// var timestamp = 1400000000;
// var a = new Date(timestamp*1000);
// var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
// var dayOfWeek = days[a.getDay()]

//https://api.openweathermap.org/data/2.5/onecall?lat=47.550910&lon=7.536470&exclude=current,minutely,hourly&appid=4fb79765aaa15cae2e6394c2733e6364

module.exports = {
    getWeatherData
}