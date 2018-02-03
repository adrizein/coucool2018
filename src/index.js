'use strict';

import * as _ from 'lodash';

import './style.css';
import * as images from './images';


window.onload = () => {
    const
        artwork = document.getElementById('artwork'),
        {left, top} = artwork.getBoundingClientRect();

    const targets = {
        cercleCentral: {y: -700, x: 300},
        demiCercleHaut: {x: 1526, y: 900},
        pilule: {x: -300, y: 1000},
        rectangleBicolore: {y: 910},
        rectangleCentre: {x: 2000, y: -200},
        rectangleCuir: {x: -50, y: -50},
        rectangleJaune: {x: 2000},
        rectangleOrange: {x: 1500, y: 947},
        triangleRouge: {x: -1300},
    };

    const elements = _.mapValues(targets, (end, name) => {
        const image = new Image();
        image.src = images[name];
        image.id = _.kebabCase(name);

        artwork.appendChild(image);
        const
            {x, y} = image.getBoundingClientRect(),
            start = {x: x - left, y: y - top};

        return {
            image,
            trajectory: makeLineTrajectory(
                start,
                _.defaults(end, start),
                0.13,
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


function makeLineTrajectory(start, end, stop = 1) {
    return function trajectory(t) {
        if (t > stop) {
            t = stop;
        }
            const
                x = (end.x - start.x) * t / stop + start.x,
                y = (end.y - start.y) * t / stop + start.y;

            window.requestAnimationFrame(() => {
                this.image.style.left = `${x}px`;
                this.image.style.top = `${y}px`;
            });
    };
}
