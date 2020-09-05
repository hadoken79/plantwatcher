import { drawToast } from "./toasts";

const getDataFromBackend = (url) => {

    return fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        if (response.ok) {
            return response.json();
            /*
            example
            [
                {
                    plantId: 1,
                    hum: 36,
                    date: '2012-12-19T06:01:17.171Z',
                    power: 99
                },
                {
                    plantId: 1,
                    hum: 32,
                    date: '2012-12-19T06:01:17.171Z',
                },
                {
                    plantId: 1,
                    hum: 12,
                    date: '2012-12-19T06:01:17.171Z',
                },
            ];
            */
        } else {
            drawToast('error', `Fehler bei Datenbezug Servercode ${response.status}`);
            console.log(response.statusText);
        }
    })

};

const updatePlant = (url, data) => {

    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)// body data type must match "Content-Type" header
    }).then(response => {
        if (response.ok) {
            return response.statusText;
        } else {
            drawToast('error', `Fehler bei update der Pflanze ${response.status}`);
            console.log(response.statusText);
        }
    })
}




export { getDataFromBackend, updatePlant };
