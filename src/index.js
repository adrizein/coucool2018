'use strict';

import * as _ from 'lodash';
import 'waypoints/lib/noframework.waypoints.min';

import './style.css';
import * as images from './images';
import {Composition, MovingImage, Trajectory} from './composition';


window.onload = () => {
    const
        artwork = document.getElementById('artwork');

    const composition = new Composition(artwork, 650, 1730);

    const targets = {
        cercleCentral: {y: -700, x: 300},
        demiCercleHaut: {x: 1526, y: 900},
        pilule: {x: -300, y: 1000},
        rectangleBicolore: {y: 910},
        rectangleCentre: {x: 2000, y: -200},
        rectangleCuir: {x: -100, y: -120},
        rectangleJaune: {x: 2000},
        rectangleOrange: {x: 1500, y: 947},
        triangleRouge: {x: -1300},
    };

    _.forEach(targets, (end, name) => {
        const image = new MovingImage(
            {
                id: _.kebabCase(name),
                src: images[name],
            },
            new Trajectory()
        );

        composition.add(image);
    });

    const maxScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    document.addEventListener('scroll', () => {
        const t = window.scrollY / maxScrollY;
        composition.animate(t);
    });

    window.addEventListener('resize', () => {
        window.requestAnimationFrame(() => {
            composition.rescale();
        });
    });

    const waypoint = new Waypoint({
        element: document.getElementById('ethos'),
        handler(direction) {
            console.log('fin de ethos', direction);
        },
    });
};
