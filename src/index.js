'use strict';

import * as _ from 'lodash';

import './style.css';
import * as compositionImages from './images/composition';
import {Composition, MovingImage, LinearTrajectory} from './composition';


const movingImages = {
    bigRedTriangle: {zIndex: 2, startX: 92, startY: 39, endX: 1500, endY: 39},
    blackHalfCircle: {zIndex: 5, startX: 677, startY: 39, endX: 677, endY: -180},
    blueHair: {zIndex: 3, startX: 778, startY: 358, endX: 778, endY: -200},
    bluePillLeft: {zIndex: 1, startX: 150, startY: 481, endX: 1400, endY: -100},
    blueRectangleCenterRight: {zIndex: 2, startX: 675, startY: 358, endX: 675, endY: 860},
    blueRectangleTop: {zIndex: 6, startX: 663, startY: 104, endX: 663, endY: 850},
    blueRectangleTopLeft: {zIndex: 0, startX: 181, startY: 157, endX: 181, endY: -230},
    centerCircle: {zIndex: 4, startX: 545, startY: 127, endX: 0, endY: -350, eventGeneratingShape:'circle'},
    featherCircle: {zIndex: 1, startX: 214, startY: 217, endX: -150, endY: -150},
    fingers: {zIndex: 1, startX: 191, startY: 483, endX: 191, endY: 900},
    greenCircle: {zIndex: 1, startX: 589, startY: 282, endX: 1589, endY: 1282},
    greenRectangleTopLeft: {zIndex: 1, startX: 243, startY: 129, endX: 1400, endY: 800},
    orangeRectangleCenter: {zIndex: 1, startX: 245, startY: 422, endX: -400, endY: 900},
    palmTree: {zIndex: 0, startX: 417, startY: 542, endX: 417, endY: 1042},
    photocopySmallLeft: {zIndex: 0, startX: 246, startY: 462, endX: -200, endY: 280},
    photocopyShapeTopRight: {zIndex: 2, startX: 627, startY: 238, endX: 100, endY: -200},
    pillCenterRight: {zIndex: 5, startX: 465, startY: 336, endX: -200, endY: 336},
    redRectangleTopRight: {zIndex: 3, startX: 964, startY: 227, endX: 364, endY: -30},
    smallBlackRectangleCenter: {zIndex: 1, startX: 778, startY: 542, endX: 1400, endY: 542},
    textureRectangleCenter: {zIndex: 2, startX: 417, startY: 301, endX: -360, endY: 100},
    woodTriangle: {zIndex: 2, startX: 245, startY: 423, endX: 775, endY: 853},
    yellowRectangleCenter: {zIndex: 1, startX: 685, startY: 358, endX: 1400, endY: 359},
    yellowRectangleCenterLeft: {zIndex: 1, startX: 92, startY: 422, endX: -900, endY: 422},
    zebraPill: {zIndex: 2, startX: 695, startY: 116, endX: 1000, endY: -150},
};

window.onload = async () => {
    const
        {width, height} = document.body.getBoundingClientRect(),
        main = document.getElementById('main'),
        artwork = document.getElementById('artwork'),
        composition = new Composition(artwork, 843, 1353, width < height),
        footer = document.querySelector('footer'),
        chevron = document.getElementById('chevron'),
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
                    /*
                    hidden: element.classList.contains('hidden'),
                    activate() {
                        this.element.classList.add('active');
                    },
                    deactivate() {
                        this.element.classList.remove('active');
                    },
                    reveal() {
                        this.element.classList.remove('hidden');
                    },
                    hide() {
                        this.element.classList.add('hidden');
                    },
                    next() {
                        const next_index = this.index+1
                        const next_section = next_index < sections.length ? sections[next_index] : null
                        return next_section;
                    },
                    previous() {
                        const previous_index = this.index-1
                        const previous_section = previous_index >=0 ? sections[previous_index] : null
                        return previous_section;
                    }
                    */
                };
            });

    let
        switching = false,
        previousSection = null,
        activeSection = null;

    // Load composition
    artwork.style.visibility = 'hidden';
    const p = [];
    _.forEach(movingImages, ({zIndex, startX, startY, endX, endY, eventGeneratingShape}, name) => {
        const image = new MovingImage(
            {
                id: _.kebabCase(name),
                src: compositionImages[name],
                zIndex,
                trajectory: new LinearTrajectory(startX, startY, endX, endY),
                shape:eventGeneratingShape,
            },
        );

        p.push(composition.add(image));
    });
    // Wait for composition to show the artwork
    await Promise.all(p);
    artwork.style.visibility = 'visible';

    // Events selectors
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});
    main.addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()), {passive: true});
    window.onhashchange = onHash;

    _.forEach(document.querySelectorAll('h2, .link'), (element) => {
        element.addEventListener('click', (event) => {
            console.log(event.target.classList);
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
    window.requestAnimationFrame(() => artwork.classList.add('loaded'));

    function getSectionByName(sectionName) {
        return _.find(sections, ({name}) => name === sectionName);
    }

    async function setActiveSection(section) {
        //highlight title
        switching = true;
        _.map(sections, (s) => {if (s.title) {s.title.classList.remove('active');}});
        if (section.title) {
            section.title.classList.add('active');
        }

        //Change background
        document.body.classList.add(section.name);
        document.querySelectorAll('.background-color').forEach((element) => {
            element.classList.add(section.name);
            if (activeSection) {
                element.classList.remove(activeSection.name);
            }
        });
        if (activeSection) {
            document.body.classList.remove(activeSection.name);
        }

        let delay = 0;
        if (activeSection && section.name !== activeSection.name) {
            await Velocity(activeSection.element, 'scroll', {
                container: main,
                duration: main.scrollTop,
                easing: 'ease-in',
                queue: false,
            });
            activeSection.element.classList.remove('active');

            delay = 1000;
        }

        if (!activeSection) {
            delay = 1000;
        }

        section.element.classList.add('active');
        activeSection = section;
        window.location.hash = section.name;

        await Velocity(section.element, 'scroll', {
            offset: section.element.style.paddingTop,
            container: document.getElementById('main'),
            duration: composition.scaledHeight,
            easing: 'ease-in',
            delay,
            queue: false,
        });

        switching = false;
    }

    function onScroll() {
        const t = Math.clamp(main.scrollTop / composition.scaledHeight, 0, 1);

        if (main.scrollTop === 0) {
            chevron.style.display = 'block';
        }
        else {
            chevron.style.display = 'none';
        }

        composition.animate(t);
        activeSection.element.style.opacity = Math.clamp(t, 0, 1);
    }

    function onResize() {
        const {width, height} = document.body.getBoundingClientRect();

        composition.resize();

        if (width < height) {
            if (!artwork.classList.contains('portrait')) {
                // switch to portrait mode
                // do not forget to change the timeout value when changing the css transition duration
                composition.portrait(0);
            }
        }
        else if (artwork.classList.contains('portrait')) {
            // switch to landscape mode
            composition.landscape(0);
        }

        document.querySelectorAll('section').forEach((element) => {
            element.style.paddingTop = `${composition.scaledHeight}px`;
        });
    }

    function onHash() {
        if (!switching) {
            if (window.location.hash.length > 1) {
                const urlSection = getSectionByName(window.location.hash.replace('#', ''));
                if (urlSection) {
                    setActiveSection(urlSection);
                }
            }
            else {
                setActiveSection(getSectionByName('ethos'));
            }
        }
    }
};
