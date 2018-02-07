'use strict';

import * as _ from 'lodash';
import 'waypoints/lib/noframework.waypoints.min';
import * as $ from 'jquery';

import './style.css';
import * as images from './images';
import {Composition, MovingImage, LinearTrajectory} from './composition';


window.goToSection = function(section) {

    // TO DO
    // Voici le comportement souhaité 
    // Fadeout des anciens fonds fadein des nouveaux
    // On remonte le scroll du #main (ce qui fait revenir l'artwork avec les bons fonds) et fade out

    // On change la section qui est en display block
    var pouet =  document.getElementById("main").getElementsByTagName("section")   
    console.log(pouet);
    for (var i = 0; i < pouet.length; i++) {
      pouet[i].style.display = 'none';        
    }
    document.getElementById(section).style.display = "block";

}

window.onload = () => {

    const
        artwork = document.getElementById('artwork');

    const composition = new Composition(artwork, 650, 1730);

    const movingImages = {
        cercleCentral:       {z_index: 3, x_i: 931, y_i: 101, x_f: 300, y_f: -700},
        demiCercleHaut:      {z_index: 4, x_i: 1200, y_i: 0, x_f: 1526, y_f: 900},
        pilule:              {z_index: 4, x_i: 538, y_i: 759, x_f: -300, y_f: 1000},
        rectangleBicolore:   {z_index: 2, x_i: 540, y_i: 617, x_f: 540, y_f: 910},
        rectangleCentre:     {z_index: 2, x_i: 580, y_i: 440, x_f: 2000, y_f: -200},
        rectangleCuir:       {z_index: 3, x_i: 1282, y_i: 746, x_f: -100, y_f: -120},
        rectangleJaune:      {z_index: 1, x_i: 0, y_i: 703, x_f: 2000, y_f: 703},
        rectangleOrange:     {z_index: 5, x_i: 1174, y_i: 47, x_f: 1500, y_f: 947},
        triangleRouge:       {z_index: 1, x_i: 0,y_i: 0,x_f: -1300, y_f: 0}
    };

    _.forEach(movingImages, (end, name) => {
        const image = new MovingImage({
            id: _.kebabCase(name),
            src: images[name],
            z_index: end.z_index,
            trajectory: new LinearTrajectory(end.x_i, end.y_i, end.x_f, end.y_f)
        });
        composition.add(image);        
    });

    window.addEventListener('resize', () => {
        window.requestAnimationFrame(() => {
            composition.rescale();
        });
    });

    const maxScrollY = 50;

    main: document.getElementById('main');
    main.addEventListener('scroll', () => {
        const t = main.scrollTop / maxScrollY;
        composition.animate(t);
        // TO DO 
        // Faire un fade in et un fade de la section visible 
        //(la choper en la selectionnant par le tag section et le display à block) 
    });

    const waypoint = new Waypoint({
        element: document.getElementById('ethos'),
        handler(direction) {
            console.log('fin de ethos', direction);
        },
    });


};
