//require('./style.scss'); //adding styling for webpack
import { drawLineChart, drawGauge } from './charts.js';
import { getDataFromBackend, updatePlant } from './com.js';
import { makeSortable, updateAllPlantsInDB, toggleSortable, toggleCardWiggle, toggleSettingsView, generatePlacehoderCard, toggleDummyCard, handleDelete } from './DashboardSettings';
import { drawToast } from './toasts';
//import { permittedCrossDomainPolicies } from 'helmet';
//import { reject } from 'lodash';
//import { resolve } from 'path';



document.addEventListener('DOMContentLoaded', (event) => {
    //connection with websocketserver.js Port 8080 (nativ html5)
    //-------Sockets-----------------------------------------------------
    let ws = new WebSocket('ws://192.168.0.74:8080');
    ws.onopen = () => {
        console.log('websocket to host connected ...');
        ws.send('client listening');
    };

    ws.onmessage = (ev) => {
        //console.log(ev.data);
        let message = JSON.parse(ev.data);
        console.log(`ws-incoming-message: ${message}`);
        if (message.type == 'update') updateSinglePlant(message.plant[0]); // <--- if new data arrives from sensors while dashboard is rendered, update softly
        if (message.type == 'error') drawToast('error', message.msg);
    };

    //--------------------------Navigation-------------------------------
    const navBurger = document.querySelector('.navbar-burger');
    if (navBurger) {
        //check if visible
        if (getComputedStyle(navBurger, null).display === 'block') {
            navBurger.addEventListener('click', () => {
                navBurger.classList.toggle('is-active');
                document
                    .querySelector('.navbar-menu')
                    .classList.toggle('is-active');
            });
        }
    }
    drawDashboard();
    makeSortable(document.getElementById('plantList'));

    document.getElementById('settingsButton').addEventListener('click', async (e) => {

        let elems = document.querySelectorAll('.card');
        await toggleDummyCard();
        toggleSortable();
        toggleCardWiggle();
        toggleSettingsView();
    });

    document.getElementById('deleteModal-close').addEventListener('click', (e) => {
        document.getElementById('deleteModal').classList.remove('is-active');
    })


});


//--------------------------------Methods------------------------------------------------------------------//

const drawDashboard = async () => {

    //render Weather Info // async if needed
    let plants = await getDataFromBackend('/api/getPlants');

    if (plants.length == 0) {
        drawToast('error', 'noch keine Pflanzen vorhanden.\n erfasse Dein erstes Gewächs über den Settings Button...', 5000);
    }

    for (const plant of plants) {//for loop to keep order of position parameter
        //get readings for this plant
        let readings = await getDataFromBackend(`/api/getPlantReadings?pId=${plant.plantId}`)

        let elements = await createPlantCard(plant);
        //fillCardWithData(plant, readings, title, powerstat, gaugeArea, lineArea, lastUpdate, titleInput, idInput);
        fillCardWithData(plant, readings, elements);
    };

};

const updateSinglePlant = async (plant) => {

    let readings = await getDataFromBackend(`/api/getPlantReadings?pId=${plant.plantId}`)

    //get elemets of specific card
    let card = document.getElementById(plant.plantId);
    let title = card.firstChild.firstChild;
    let powerstat = title.nextSibling;
    let gaugeArea = card.firstChild.nextSibling.firstChild;
    let lineArea = gaugeArea.nextSibling;
    let lastUpdate = lineArea.nextSibling;
    let titleInput = card.firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
    let idInput = card.firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
    let elements = [title, powerstat, gaugeArea, lineArea, lastUpdate, titleInput, idInput, card];
    //updata values
    fillCardWithData(plant, readings, elements);
}

const fillCardWithData = (plant, readings, elements) => {
    //[title, powerstat, gaugeArea, lineArea, lastUpdate, titleInput, idInput, card]

    let title = elements[0];
    let powerstat = elements[1];
    let gaugeArea = elements[2];
    let lineArea = elements[3];
    let lastUpdate = elements[4];
    let titleInput = elements[5];
    let idInput = elements[6];


    title.innerText = `${plant.name}`;
    titleInput.value = `${plant.name}`
    idInput.value = `ID für Sensor: ${plant.plantId}`;

    //cleanup older i-cons and graphs
    while (powerstat.firstChild) {
        powerstat.removeChild(powerstat.firstChild);
    }
    while (gaugeArea.firstChild) {
        gaugeArea.removeChild(gaugeArea.firstChild);
    }
    while (lineArea.firstChild) {
        lineArea.removeChild(lineArea.firstChild);
    }

    if (readings.length > 0) {

        title.className = 'card-header-title';
        powerstat.className = 'card-header-icon';
        let iconspan = document.createElement('span');
        iconspan.className = 'icon';
        let icon = document.createElement('i');
        let power = readings[0].power;

        let faPowerIcon = '';

        if (power > 85) {
            iconspan.classList.add('has-text-success');
            faPowerIcon = 'fas fa-battery-full';
        } else if (power > 60) {
            iconspan.classList.add('has-text-success');
            faPowerIcon = 'fas fa-battery-three-quarters';
        } else if (power > 40) {
            iconspan.classList.add('has-text-info');
            faPowerIcon = 'fas fa-battery-half';
        } else if (power > 20) {
            iconspan.classList.add('has-text-warning');
            faPowerIcon = 'fas fa-battery-quarter';
        } else {
            iconspan.classList.add('has-text-danger');
            faPowerIcon = 'fas fa-battery-empty';
        }


        icon.className = faPowerIcon;
        iconspan.appendChild(icon);
        powerstat.appendChild(iconspan);

        //grafics for stats

        drawGauge(readings, gaugeArea); //charts.js


        drawLineChart(readings, lineArea);

        //put timestamp for latest update at bottom
        let latestDataUpdate = new Date(readings[0].date);

        lastUpdate.innerHTML = `letztes Update:<br> ${latestDataUpdate.toDateString()} | ${latestDataUpdate.toLocaleTimeString()}`;

    } else {
        //if plant exsts but no sensordata avialable jet. set placeholder values
        title.innerText += '  ||  noch keine Daten';
        title.classList.add('has-text-danger');

        lastUpdate.innerHTML = `letztes Update:<br> nicht verfügbar`;
        //dummydata to still draw element at same size
        drawGauge([{ "hum": 1 }], gaugeArea); //charts.js
        drawLineChart([{ "hum": 1 }], lineArea);
    }
}

const createPlantCard = (plant) => {
    return new Promise((resolve, reject) => {
        let wrapper = document.getElementById('plantList');
        //layout
        let column = document.createElement('div');
        //------------------------------------------------different layouts for resolutions-------------------------------------------------
        column.classList.add(
            'column',
            'is-one-quarter-fullhd',
            'is-one-third-desktop',
            'is-half-tablet'
        );

        //Card Elements
        let card = document.createElement('div');
        card.className = 'card';
        card.id = plant.plantId;
        let header = document.createElement('header');
        header.className = 'card-header';
        let deleteButton = document.createElement('button');
        deleteButton.className = 'delete is-hidden';

        deleteButton.addEventListener('click', (e) => {
            let plantId = e.target.parentElement.parentElement.id;
            let confirmButton = document.getElementById('deleteModal-confirm');
            confirmButton.replaceWith(confirmButton.cloneNode(true));//remove old eventlisteners
            handleDelete(plantId);
        })

        let title = document.createElement('p');
        title.className = 'card-header-title';

        let cardBody = document.createElement('div');
        cardBody.className = 'card-content';
        let gaugeArea = document.createElement('div');

        let lineArea = document.createElement('div');

        //power icon
        let powerstat = document.createElement('div');

        //last update
        let lastUpdate = document.createElement('div');

        //editorElements
        let dataForm = document.createElement('form');
        dataForm.className = "is-hidden"
        let titleInput = document.createElement('input');
        titleInput.className = "input titleInput is-primary";
        titleInput.setAttribute("type", "text");
        titleInput.setAttribute("required", "");
        titleInput.setAttribute("maxlength", "20");

        let idInput = document.createElement('input');
        idInput.className = "input is-primary";
        idInput.setAttribute("disabled", "");
        idInput.setAttribute("type", "text");
        idInput.setAttribute("required", "");
        idInput.setAttribute("maxlength", "20");

        let saveButton = document.createElement('button');
        saveButton.className = "button is-small is-primary is-pulled-right is-rounded settingsSaver";
        saveButton.innerText = "save";

        //---------------------------Eventlistener for Card-SaveButton has to be conditional if new plant is created------------------//
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault();
            if (e.target.classList.contains('newPlant')) {

                let newId = await getDataFromBackend('/api/getNewId');
                //remove dummytags
                e.target.className = 'button is-small is-primary is-pulled-right is-rounded settingsSaver';//change button style
                e.target.innerText = 'save';//change savebutton text
                e.target.parentElement.parentElement.previousSibling.firstChild.nextSibling.nextSibling.classList.toggle('is-hidden');//make deletebutton visible
                e.target.parentElement.parentElement.parentElement.classList.remove('dummycard');
                e.target.parentElement.parentElement.parentElement.id = newId.plantId;//store the news id from db in card id field

                //store new Plant
                let name = e.target.previousSibling.previousSibling.value;

                let cards = document.querySelectorAll('.card');
                let position = cards.length - 1;//subtract dummy
                plant = { plantId: newId.plantId, name: name, pos: position, active: true };
                await updatePlant('/api/postPlant', plant);

            } else {
                await toggleDummyCard();
                let p = [];
                document.querySelectorAll('.titleInput:not(.dummytitle)').forEach(title => {
                    p.push(new Promise((resolve, reject) => {
                        if (title.value == '') {
                            drawToast('error', 'Pflanzenname darf nicht leer sein');
                            reject('no title');
                        } else {
                            resolve();
                        }
                    }));
                })
                try {
                    await Promise.all(p);
                } catch (err) {
                    return;
                }
            }
            updateAllPlantsInDB();//position Element for every card has to get an update, in case order has changed
            toggleSortable();
            toggleCardWiggle();
            toggleSettingsView();

        })

        dataForm.appendChild(titleInput);
        dataForm.appendChild(idInput);
        dataForm.appendChild(saveButton);
        //assemble
        header.appendChild(title);
        header.appendChild(powerstat);
        header.appendChild(deleteButton);
        card.appendChild(header);
        cardBody.appendChild(gaugeArea);
        cardBody.appendChild(lineArea);
        cardBody.appendChild(lastUpdate);
        cardBody.appendChild(dataForm);
        //cardBody.appendChild(titleInput);
        //cardBody.appendChild(idInput);
        card.appendChild(cardBody);
        column.appendChild(card);
        wrapper.appendChild(column);

        resolve([title, powerstat, gaugeArea, lineArea, lastUpdate, titleInput, idInput, card, saveButton, deleteButton]);
    })

}

export { createPlantCard }
