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
    centerCircle: {zIndex: 4, startX: 545, startY: 127, endX: 0, endY: -350, eventGeneratingShape: 'circle'},
    featherCircle: {zIndex: 1, startX: 214, startY: 217, endX: -150, endY: -150},
    fingers: {zIndex: 1, startX: 191, startY: 482, endX: 191, endY: 900},
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
        container = document.getElementById('container'),
        main = document.getElementById('main'),
        loader = document.getElementById('loader'),
        artwork = document.getElementById('artwork'),
        composition = new Composition(artwork, 843, 1353, width < height),
        coucool = document.getElementById('coucool'),
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
                };
            });

    let
        switching = false,
        activeSection = null,
        autoScroll = true,
        manualScroll = true;

    // Events selectors
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});
    main.addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()), {passive: true});
    window.onhashchange = onHash;

    coucool.addEventListener('click', async () => {
        autoScroll = false;
        composition.stopAnimation();
        await Promise.all([
            composition.runAnimation(2000, 0),
            Velocity(artwork, {opacity: 1}, {duration: 1000, easing: 'ease-in', queue: false}),
            Velocity(activeSection.element, {opacity: 0}, {
                container: main,
                duration: 1000,
                queue: false,
                easing: 'ease-in',
            }),
        ]);

        manualScroll = false;
        main.scrollTo(0, 0);
    });

    document.querySelectorAll('h2, .link').forEach((element) => {
        element.addEventListener('click', (event) => {
            const section = _.find(sections, (s) => event.target.classList.contains(s.name));
            composition.stopAnimation();
            if (section) {
                setActiveSection(section);
            }
            else {
                console.error('Should not happen, bad section name:', event.target.className);
            }
        });
    });

    document.querySelectorAll('.yes').forEach((element) => {
        element.addEventListener('click', (event) => {
            fadeContributionPage(event.target);
        });
    });

    // Load composition
    const p = [];
    _.forEach(movingImages, ({zIndex, startX, startY, endX, endY, eventGeneratingShape}, name) => {
        const image = new MovingImage(
            {
                id: _.kebabCase(name),
                src: compositionImages[name],
                zIndex,
                trajectory: new LinearTrajectory(startX, startY, endX, endY),
                shape: eventGeneratingShape,
            },
        );

        p.push(composition.add(image));
    });

    // Init
    // Wait for composition to show the artwork
    await Promise.all(p);
    loader.classList.add('exit');

    onResize();

    await frame();
    loader.parentElement.removeChild(loader);
    await frame();

    // remove the slight offset when the loader is removed
    manualScroll = false;
    main.scrollTo(0, 0);

    // initialize the composition in its exploded form
    composition.animate(1);
    container.classList.add('loaded');
    await composition.runAnimation(2000, 0);

    onHash();

    if (!activeSection) {
        setActiveSection(getSectionByName('ethos'), false);
    }


    function getSectionByName(sectionName) {
        return _.find(sections, ({name}) => name === sectionName);
    }

    async function setActiveSection(section, scroll = true) {
        let delayBeforeScrollingDown = 2000;
        switching = true;
        window.location.hash = section.name;

        //highlight title
        _.map(sections, (s) => {if (s.title) {s.title.classList.remove('active');}});
        if (section.title) {
            section.title.classList.add('active');
        }

        if (activeSection) {
            if (section.name !== activeSection.name) {
                if (main.scrollTop > 0) {
                    // Implode if we changed the section
                    const duration = 1000;
                    await Promise.all([
                        composition.runAnimation(duration, 0),
                        Velocity(artwork, {opacity: 1}, {duration, queue: false}),
                        Velocity(activeSection.element, {opacity: 0}, {duration, queue: false}),
                    ]);
                    manualScroll = false;
                    main.scrollTo(0, 0);
                }
                else {
                    delayBeforeScrollingDown = 0;
                }
            }
            else {
                // do not wait before scrolling to the top of the text otherwise
                delayBeforeScrollingDown = 0;
            }
            activeSection.element.classList.remove('active');
        }

        // Set the new section
        section.element.classList.add('active');
        activeSection = section;

        // scroll automatically if nothing happens (no click, no manual scroll)
        await frame();
        autoScroll = true;

        if (scroll) {
            setTimeout(() => {
                if (autoScroll) {
                    Velocity(activeSection.element, 'scroll', {
                        offset: activeSection.element.style.paddingTop,
                        container: main,
                        duration: 1000,
                        easing: 'ease-in',
                        queue: false,
                    });
                }
            }, delayBeforeScrollingDown);
        }
    }

    async function onScroll() {
        if (manualScroll) {
            autoScroll = false;
            if (main.scrollTop === 0) {
                chevron.style.display = 'block';
            }
            else {
                chevron.style.display = 'none';
            }

            const
                s = main.scrollTop / main.scrollHeight,
                t = Math.sin(main.scrollTop / 400) * 0.3;

            composition.stopAnimation();
            await frame();
            composition.animate(t);
            artwork.style.opacity = Math.clamp(1 - main.scrollTop / composition.scaledHeight, 0.5, 1);
            activeSection.element.style.opacity = Math.clamp(s * 10, 0, 1);
        }
        else {
            manualScroll = true;
        }
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

    async function onHash() {
        // avoid the onHash handler to be called during the setActiveSection() call
        if (switching) {
            switching = false;
        }
        else if (window.location.hash.length > 1) {
            const urlSection = getSectionByName(window.location.hash.replace('#', ''));
            if (urlSection) {
                setActiveSection(urlSection);
            }
        }
    }

    function fadeContributionPage(element) {

        var a = element;
        while (a) {
            if (a.classList.contains("contribution-page")){
                break;
            }
            a = a.parentNode;
        }

        console.log(a.id);
        var next_page_number = parseInt(a.id.slice(-1))+1
        var next_id = a.id.slice(0, -1) + next_page_number;
        var next_page = document.getElementById(next_id);
        console.log(next_id);
        Velocity(a, "fadeOut", {
            duration: 200,
            easing: 'ease-in',
            complete : function(){
                console.log("completing");
                Velocity(next_page, "fadeIn", {
                    display: "flex",
                    duration: 200,
                    easing: 'ease-in'
                });
            }
        });

    }

    async function frame() {
        return new Promise((resolve) => window.requestAnimationFrame(resolve));
    }
};
