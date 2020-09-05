export const renderWeatherWidget = async (data) => {

    let container = document.querySelector('.weatherBox');

    if (data.length > 0) {
        for (let day of data) {
            let dayElement = await buildWeatherBlock(day);
            container.appendChild(dayElement);
        }

    }
}

const buildWeatherBlock = (day) => {
    return new Promise((resolve, reject) => {
        //console.log(day);

        //get temp day and icon from rawdata
        let temp = Math.round(day.temp.day);
        let dayTs = day.dt;
        let apiIcon = day.weather[0].icon;



        //console.log(temp, dayTs, apiIcon);

        //map timestamp to day
        let millis = new Date(dayTs * 1000);
        let daynames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        let dayOfWeek = daynames[millis.getDay()];

        //map openweatherapi icons to fontawesome icons
        let faIcons = {
            '01d': { 'code': 'fas fa-sun', 'color': 'has-text-warning' },
            '02d': { 'code': 'fas fa-cloud-sun', 'color': 'has-text-warning' },
            '03d': { 'code': 'fas fa-cloud', 'color': 'has-text-grey-light' },
            '04d': { 'code': 'fas fa-cloud-meatball', 'color': 'has-text-grey-light' },
            '09d': { 'code': 'fas fa-cloud-rain', 'color': 'has-text-link' },
            '10d': { 'code': 'fas fa-cloud-showers-heavy', 'color': 'has-text-link' },
            '11d': { 'code': 'fas fa-bolt', 'color': 'has-text-danger' },
            '13d': { 'code': 'fas fa-snowflake', 'color': 'has-text-white-bis' },
            '50d': { 'code': 'fas fa-smog', 'color': 'has-text-grey-lighter' }
        }

        console.log(faIcons[apiIcon].color);
        //create weatherBlock
        let wrapper = document.createElement('div');
        wrapper.className = 'weatherData';
        let dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerText = dayOfWeek;
        let iconSpan = document.createElement('span');
        iconSpan.className = `icon ${faIcons[apiIcon].color}`;
        iconSpan.innerHTML = `<i class="${faIcons[apiIcon].code} fa-lg" aria-hidden="true"></i>`;
        let tempDiv = document.createElement('div');
        tempDiv.className = 'temp';
        tempDiv.innerText = temp;
        //build

        //iconSpan.appendChild(icon);
        wrapper.appendChild(dayDiv);
        wrapper.appendChild(iconSpan);
        wrapper.appendChild(tempDiv);


        //console.log(dayOfWeek);
        resolve(wrapper);

    })



    //weatherElement
    /*      <div class="weatherData">
           <div class="day">MO</div>
           <span class="icon has-text-success">
             <i class="fas fa-cloud-sun-rain fa-lg" aria-hidden="true"></i>
           </span>
           <div class="temp">23&deg</div>
         </div> */

    //Icon Mapping
    /* API icon		Description             fa-icon
    01d.png 	        clear sky           fas fa-sun
    02d.png 	        few clouds          fas fa-cloud-sun
    03d.png 	        scattered clouds    fas fa-cloud
    04d.png	            broken clouds       fas fa-cloud-meatball
    09d.png 	        shower rain         fas fa-cloud-rain
    10d.png 	        rain                fas fa-cloud-showers-heavy
    11d.png 	        thunderstorm        fas fa-bolt
    13d.png 	        snow                fas fa-snowflake
    50d.png	            mist                fas fa-smog
    */
}