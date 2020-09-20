import Sortable from 'sortablejs';
import {
    getDataFromBackend,
    updatePlant
} from './com.js';
import {
    drawToast
} from './toasts';
import {
    createPlantCard
} from './main';
let sortable;



const makeSortable = (collection) => {


    sortable = Sortable.create(collection, {
        animation: 250,
        disabled: true, //disable per default
        onEnd: ( /**Event*/ evt) => {
            updateAllPlantsInDB();
            let itemEl = evt.item; // dragged HTMLElement
            evt.to; // target list
            evt.from; // previous list
            evt.oldIndex; // element's old index within old parent
            evt.newIndex; // element's new index within new parent
            evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
            evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
            evt.clone // the clone element
            evt.pullMode; // when item is in another sortable: `"clone"` if cloning, `true` if moving
        },
    });


}

const toggleSortable = () => {


    let cog = document.getElementById('settingsButton');
    cog.classList.toggle("has-text-danger");

    let state = sortable.option("disabled"); // get

    sortable.option("disabled", !state); // set

}

const toggleCardWiggle = () => {
    let elems = document.querySelectorAll('.card:not(.dummycard)');
    elems.forEach(element => {

        element.classList.toggle('wiggle');
    });

}

const toggleSettingsView = () => {

    let elems = document.querySelectorAll('.card:not(.dummycard)');
    elems.forEach(element => {
        //element.firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.removeEventListener('click', null);
        //hide CardData
        element.firstChild.classList.toggle('is-hidden'); //deleteButton
        element.firstChild.nextSibling.classList.toggle('is-hidden'); //header

        element.firstChild.nextSibling.nextSibling.firstChild.classList.toggle('is-hidden'); //GaugeArea
        element.firstChild.nextSibling.nextSibling.firstChild.nextSibling.classList.toggle('is-hidden'); //LineArea
        element.firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.classList.toggle('is-hidden'); //UpdateArea

        //show inputs
        element.firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.classList.toggle('is-hidden'); //form
        //element.firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.classList.toggle('is-hidden');//title
        //element.firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.classList.toggle('is-hidden');//id
    })
}


const updateAllPlantsInDB = async () => {

    let elems = document.querySelectorAll('.card:not(.dummycard)');
    let countResponses = 0;

    for (let i = 0; i < elems.length; i++) {

        //get field data
        let title = elems[i].firstChild.nextSibling.nextSibling.firstChild.nextSibling.nextSibling.nextSibling.firstChild.value;
        let plantId = elems[i].id;

        //counter in loop is also current position parameter
        //update Database
        let data = {
            plantId: plantId,
            name: title,
            pos: i,
            active: true
        };
        try {
            let response = await updatePlant('/api/updatePlants', data);
            if (response == 'OK') {
                countResponses++;
            }
        } catch (err) {
            drawToast('error', err);
        }
    }
    if (countResponses == (elems.length)) {
        drawToast('ok', 'ok');
    } else {
        drawToast('error', 'fehler beim update');
    }

}

const generatePlacehoderCard = async () => {
    //[title, powerstat, gaugeArea, lineArea, lastUpdate, titleInput, idInput, card, saveButton, deleteButton, dataForm, header]
    let newId = await getDataFromBackend('/api/getNewId');
    let elems = await createPlantCard({
        plantId: 9999,
        name: "new Plant",
        pos: 9999
    });
    return new Promise((resolve, reject) => {
        elems[2].classList.toggle('is-hidden');
        elems[3].classList.toggle('is-hidden');
        elems[4].classList.toggle('is-hidden');
        elems[7].className = 'card dummycard'; //removed wiggle
        elems[5].classList.add('dummytitle');
        elems[5].setAttribute('placeholder', 'Neue Pflanze');
        elems[8].className = 'button is-small is-success is-pulled-right is-rounded newPlant'
        elems[8].innerText = 'neu';
        elems[6].value = `ID für Sensor: ${newId.plantId}`;
        //elems[9].classList.toggle('is-hidden');
        elems[10].classList.toggle('is-hidden');
        elems[11].classList.toggle('is-hidden');
        resolve();
    })

}

const toggleDummyCard = () => {

    let wrapper = document.getElementById('plantList');
    let dummy = document.querySelectorAll('.dummycard');
    if (dummy.length < 1) {
        return generatePlacehoderCard();
    } else {
        wrapper.removeChild(dummy[0].parentElement);
    }
}

const handleDelete = async (plantId) => {

    let data = {
        plantId: plantId
    }; //not really deleting, just setting inactiv in db
    let confirmButton = document.getElementById('deleteModal-confirm');

    confirmButton.addEventListener('click', async () => {
        await updatePlant('/api/deletePlant', data); //set choosen plant to inactive in db
        console.log('ID: ' + plantId);
        document.getElementById(plantId).parentElement.parentElement.removeChild(document.getElementById(plantId).parentElement);
        toggleModal();
        let plants = await getDataFromBackend('/api/getPlants');

        if (plants.length == 0) {
            drawToast('error', 'Keine Pflanzen mehr vorhanden.\n erfasse Dein erstes Gewächs über den Settings Button...', 5000);
        }
    });
    toggleModal();


}

const toggleModal = () => {
    let modal = document.getElementById('deleteModal');
    modal.classList.toggle('is-active');
}

const toggleWeatherBar = () => {
    let container = document.querySelector('.weatherBox');
    container.classList.toggle('is-hidden');
}


export {
    makeSortable,
    updateAllPlantsInDB,
    toggleSortable,
    toggleCardWiggle,
    toggleSettingsView,
    generatePlacehoderCard,
    toggleDummyCard,
    handleDelete,
    toggleWeatherBar
}