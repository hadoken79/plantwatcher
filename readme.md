## A plant humidity monitoring##

This is a server-app, based on node.js who monitors the humidity for plants. 

*to run this application under windows, aditional to docker-desktop, python >2 has to be installed on the host system*

the server listens for data from sensors wich are send over wifi and displays them in dashboard.html. messuring data is storad in a mongo db-docker volume. humidity values are shown with gauges and linecharts. the status can also be requested via a telegram bot. wich has to be generated for the user in telegram.

the sensors are build witch esp32 microcontrollers and humidity sensors, powered with solar pannels.


*all static files are generated with webpack*

therefore only one file "bundle.js " is referenced in "dashboard.html"
the styling ist made with sass bulma.

*installaion*
1. pull this repo to local folder
2. rename sample-env in .env and replace example values with your data
3. run docker-compose up --build in terminal from application-root folder
4. bash in mongo container. ('auth' has been enabled during build, in docker-compose)
`docker exec -it plant_mongo /bin/bash`
5. login as admin
`mongo -u [your admin user in .env]`
6. add user and db
`db.createCollection([yourDBName])

db.createUser(
{
    user: "[yourUserName]",
    pwd: "[yourPassword]",
    roles: [
      { role: "readWrite", db: "[yourDBName]" }
    ]
})

`
6. restart application and navigate to your defined port.