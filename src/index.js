'use strict';

const _ = require('lodash');

import * as images from './images';

import './style.css';

window.onload = () => {

    const artwork = document.getElementById('artwork');

    const targets = {
        cercleCentral: {x: 0, y: 0},
        demiCercleHaut: {x: 0, y: 0},
        pilule: {x: 0, y: 0},
        rectangleBicolore: {x: 0, y: 0},
        rectangleCentre: {x: 0, y: 0},
        rectangleCuir: {x: 0, y: 0},
        rectangleJaune: {x: 0, y: 0},
        rectangleOrange: {x: 0, y: 0},
        triangleRouge: {x: 300, y: 1000},
    };


    const elements = _.mapValues(targets, (end, name) => {
        const image = new Image();
        image.src = images[name];
        image.id = _.kebabCase(name);

        artwork.appendChild(image);

        return {
            image,
            trajectory: makeLineTrajectory(
                image.getBoundingClientRect(),
                end
            ),
        };
    });

    const maxScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    document.addEventListener('scroll', () => {
        const t = window.scrollY / maxScrollY;
        _.forEach(elements, (element) => {
            element.trajectory(t);
        });
    });
};


function makeLineTrajectory(start, end) {
    return function trajectory(t) {
        const
            x = (end.x - start.x) * t + start.x,
            y = (end.y - start.y) * t + start.y;

        window.requestAnimationFrame(() => {
            this.image.style.left = `${x}px`;
            this.image.style.top = `${y}px`;
        });
    };
}
