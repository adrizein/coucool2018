'use strict';

import * as _ from 'lodash';

import './style.css';
import * as images from './images';
import {Composition, MovingImage, LinearTrajectory} from './composition';


const movingImages = {
    cercleCentral: {zIndex: 3, startX: 931, startY: 101, endX: 300, endY: -700},
    demiCercleHaut: {zIndex: 4, startX: 1200, startY: 0, endX: 1726, endY: 1400},
    pilule: {zIndex: 4, startX: 759, startY: 538, endX: -400, endY: 1500},
    rectangleBicolore: {zIndex: 2, startX: 541, startY: 617, endX: 541, endY: 1800},
    rectangleCentre: {zIndex: 2, startX: 580, startY: 440, endX: 2000, endY: -200},
    rectangleCuir: {zIndex: 3, startX: 1282, startY: 746, endX: -100, endY: -120},
    rectangleJaune: {zIndex: 1, startX: 0, startY: 703, endX: 2000, endY: 703},
    rectangleOrange: {zIndex: 5, startX: 1174, startY: 47, endX: 1700, endY: 1447},
    triangleRouge: {zIndex: 1, startX: 0, startY: 0, endX: -1300, endY: 0},
};


window.onload = async () => {
    const
        artwork = document.getElementById('artwork'),
        composition = new Composition(artwork, 415, 865),
        footer = document.querySelector('footer'),
        chevron = document.getElementById('chevron'),
        {height: headerHeight} = document.querySelector('header').getBoundingClientRect(),
        sections = _.map(
            document.querySelectorAll('section'), (element, index) => {
                const
                    name = element.id,
                    title = document.querySelector(`nav h2.${name}`);

                return {
                    index,
                    name,
                    element,
                    title,
                    hidden: element.classList.contains('hidden'),
                    activate() {
                        this.element.classList.add('active');
                        // light up the nav button
                        if (this.title) {
                            this.title.classList.add('active');
                        }
                    },
                    deactivate() {
                        this.element.classList.remove('active');
                        // light down the nav button
                        if (this.title) {
                            this.title.classList.remove('active');
                        }
                    },
                    reveal() {
                        if (this.hidden) {
                            this.element.classList.remove('hidden');
                        }
                    },
                    hide() {
                        if (this.hidden) {
                            this.element.classList.add('hidden');
                        }
                    },
                };
            });

    let
        previousSection = null,
        activeSection = null;

    // Load composition
    const p = [];
    _.forEach(movingImages, ({zIndex, startX, startY, endX, endY}, name) => {
        const image = new MovingImage(
            {
                id: _.kebabCase(name),
                src: images[name],
                zIndex,
                trajectory: new LinearTrajectory(startX / 2, startY / 2, endX / 2, endY / 2),
            },
        );

        p.push(composition.add(image));
    });

    artwork.style.visibility = 'hidden';

    // Wait for composition to load
    await Promise.all(p);

    artwork.style.visibility = 'visible';

    // Events selectors
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});
    window.onhashchange = onHash;

    _.forEach(document.querySelectorAll('h2, .link'), (element) => {
        element.addEventListener('click', (event) => {
            const section = _.find(sections, (s) => event.target.classList.contains(s.name));
            if (section) {
                setActiveSection(section);
            }
            else {
                console.error('Should not happen, bad section name:', event.target.className);
            }
        });
    });

    // Init
    onResize();
    onHash();

    function onHash() {
        if (window.location.hash.length > 1) {
            const urlSection = _.find(sections, ({name}) => name === window.location.hash.replace('#', ''));
            if (urlSection) {
                setActiveSection(urlSection);
            }
        }
    }

    async function setActiveSection(section) {
        previousSection = activeSection;
        activeSection = section;

        if (previousSection) {
            previousSection.deactivate();
            await composition.runAnimation(1000, 0);
            previousSection.hide();
        }
        else {
            footer.classList.add('invisible');
            //chevron.classList.add('invisible');
        }

        activeSection.reveal();
        window.scrollTo(0, activeSection.element.offsetTop);
        activeSection.activate();

        return composition.runAnimation(1000, 1);
    }

    function onResize() {
        composition.rescale();
        document.querySelectorAll('section .spacer').forEach((spacer) => {
            spacer.style.height = `${headerHeight}px`;
        });
    }
};
