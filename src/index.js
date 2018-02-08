'use strict';

import * as _ from 'lodash';
import 'waypoints/lib/noframework.waypoints.min';
import 'waypoints/lib/shortcuts/inview.min';

import './style.css';
import * as images from './images';
import {Composition, MovingImage, LinearTrajectory} from './composition';



window.onload = async () => {
    const
        artwork = document.getElementById('artwork'),
        composition = new Composition(artwork, 830, 1730);

    const movingImages = {
        cercleCentral: {zIndex: 3, startX: 931, startY: 101, endX: 300, endY: -700},
        demiCercleHaut: {zIndex: 4, startX: 1200, startY: 0, endX: 1526, endY: 900},
        pilule: {zIndex: 4, startX: 759, startY: 538, endX: -300, endY: 1000},
        rectangleBicolore: {zIndex: 2, startX: 540, startY: 617, endX: 540, endY: 1400},
        rectangleCentre: {zIndex: 2, startX: 580, startY: 440, endX: 2000, endY: -200},
        rectangleCuir: {zIndex: 3, startX: 1282, startY: 746, endX: -100, endY: -120},
        rectangleJaune: {zIndex: 1, startX: 0, startY: 703, endX: 2000, endY: 703},
        rectangleOrange: {zIndex: 5, startX: 1174, startY: 47, endX: 1500, endY: 947},
        triangleRouge: {zIndex: 1, startX: 0, startY: 0, endX: -1300, endY: 0},
    };

    await Promise.props(_.mapValues(movingImages, ({zIndex, startX, startY, endX, endY}, name) => {
        const image = new MovingImage(
            {
                id: _.kebabCase(name),
                src: images[name],
                zIndex,
                trajectory: new LinearTrajectory(startX, startY, endX, endY),
            },
        );

        return composition.add(image);
    }));

    const ethos = document.querySelector('section.ethos');
    const headerHeight = $('header').height();
    const root = $('html, body');
    let maxScrollY, paddingTop;

    function onScroll() {
        const scroll = window.scrollY;
        let t;
        if (window.scrollY > maxScrollY) {
            t = 2 - scroll / maxScrollY;
        }
        else {
            t = scroll / maxScrollY;
        }

        console.log(t);
        composition.animate(t);
    }

    function onResize() {
        composition.rescale();
        maxScrollY = composition.height;
        paddingTop = maxScrollY + headerHeight;
        ethos.style.paddingTop = `${paddingTop}px`;
    }

    onResize(); onScroll();

    document.addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()));
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()));


    $('nav h2').on('click', function onClick() {
        const part = _.filter(this.classList, (cls) => cls !== 'active')[0];

        const origin = root.scrollTop();
        let target = $(`section.${part} p:first-child`).offset().top - headerHeight - 20;
        if (origin > target) {
            target -= 2;
        }
        root.animate({scrollTop: target}, Math.abs(origin - target));
    });


    _.forEach(document.querySelectorAll('section p:first-child'), (element) => {
        const part = element.parentElement.classList[0];
        return new Waypoint.Inview({
            element,
            handler() {
                $('h2, section').removeClass('active');
                $(`.${part}`).addClass('active');
            },
            offset: `${headerHeight + 200}px`,
        });
    });

};
