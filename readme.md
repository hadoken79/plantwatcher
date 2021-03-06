## A plant humidity monitoring##

This is a server-app, based on node.js which monitors the humidity of plants. 

*to run this application under windows, aditional to docker-desktop, python >2 has to be installed on the host system*

the server listens for data from sensors which are sent over wifi, and displays them in index.html. Messured data is stored in a mongo db-docker volume. humidity values are shown with gauges and linecharts. the status can also be requested via telegram-bot. which has to be generated for the user in telegram.
Additional weather forecast data is displayed in index.html therefore a valid api token, along with lat and long values for your location have to be provided in .env.
A token can be generated for free at: http://openweathermap.org

the sensors in my case are build with esp32 microcontrollers and capacitive humidity sensors, powered with solar pannels or lithium batteries.
But anything will work, as long as data is transfered over wifi to server api. Data has to be in json format.
`"{\"plantId\": "\1\", \"hum\": \"66\", \"power\": \"99\"}"`
Humvals have to be between 1 and 99.
Code for esp32 is provided in esp32 folder.


*all static files are generated with webpack*

all js, css, favicon, icons are linked automatic
the styling ist made with sass bulma.

*installaion*
1. pull this repo to local folder
2. rename sample-env in .env and replace example values with your data
3. update ipaddress for your server in esp32 code and in main.js for websocket connection. if your run this app on a public server (not recomended) you could use your domain instead of ip. If you use my esp32 code, you have to add your own Wifi Configuration File to your Arduino-IDE Libaries.
In my case ~/arduino-1.8.13-linux64/arduino-1.8.13/libraries/Configuration

(in WIFIConf.h)
```
 const char *SSID = "Your SSID";
 const char *WiFiPassword = "Your Password";
```
4. run docker-compose up --build in terminal from application-root folder
5. bash in mongo container. ('auth' has been enabled during build, in docker-compose)
`docker exec -it plant_mongo /bin/bash`
6. login as admin
`mongo -u [your admin user in .env]`
7. add user and db

```
db.createCollection([yourDBName])
db.createUser(
{
    user: "[yourUserName]",
    pwd: "[yourPassword]",
    roles: [
      { role: "readWrite", db: "[yourDBName]" }
    ]
})
```

8. restart application and navigate to your defined port.

The Dashboard should be self explanatory.