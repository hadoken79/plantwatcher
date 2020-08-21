import * as GaugeChart from 'gauge-chart';
import styles from './style.scss';
import { createWebSocketStream } from 'ws';

const drawLineChart = (readings, parent) => {
    if (!parent) {
        console.log('Error! do LineArea found in html');
        return;
    }
    let frame = document.createElement('canvas');
    frame.className = 'is-clipped';
    frame.width = 270; //270
    frame.height = 150; //150

    let ctx = frame.getContext('2d');

    //Y-Axis
    ctx.beginPath();
    ctx.moveTo(1, 0);
    ctx.lineTo(1, frame.height);

    //100 and 50% indicator
    ctx.moveTo(1, 1);
    ctx.lineTo(frame.width, 1);

    ctx.moveTo(1, frame.height / 2);
    ctx.lineTo(frame.width, frame.height / 2);

    //X-Axis
    ctx.moveTo(1, frame.height - 1);
    ctx.lineTo(frame.width, frame.height - 1);
    ctx.stroke();

    ctx.strokeStyle = styles.lineColor;
    ctx.beginPath();
    //Readings
    let beginX = 1;
    //let beginY;
    let beginY =
        frame.height - 1 - ((frame.height - 1) / 100) * readings[0].hum;

    readings.forEach((reading, i) => {
        let step = (frame.width - 1) / (readings.length - 1);
        let yVal = frame.height - 1 - ((frame.height - 1) / 100) * reading.hum;
        step = i == 0 ? 0 : step;
        ctx.moveTo(beginX + step * (i - 1), beginY);
        ctx.lineTo(beginX + step * i, yVal);
        beginY = yVal;
    });
    ctx.stroke();

    parent.appendChild(frame);
};

const drawGauge = (readings, parent) => {
    //let element = document.querySelector(`#gaugeArea`); //${elem.plantId}
    if (!parent) {
        console.log('Error! no GaucheArea found in html');
        return;
    }

    let latestVal = readings[readings.length - 1].hum.toString(); //value works somehow only as string
    let arcColor1;

    //colormapping
    if (latestVal >= 60) {
        arcColor1 = styles.arcColorOk;
    } else if (latestVal < 60 && latestVal > 40) {
        arcColor1 = styles.arcColorWarning;
    } else {
        arcColor1 = styles.arcColorDanger;
    }

    let gaugeOptions = {
        hasNeedle: true,
        needleColor: styles.needleColor,
        needleUpdateSpeed: 1000,
        arcDelimiters: [latestVal],
        arcColors: [arcColor1, styles.arcColor2],
        rangeLabel: ['0', '100'],
        centralLabel: latestVal,
    };

    // Drawing and updating the chart
    GaugeChart.gaugeChart(parent, 270, gaugeOptions).updateNeedle(latestVal);
};

export { drawLineChart, drawGauge };
