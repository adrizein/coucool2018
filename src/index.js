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


function getVerticalPosition(element) {
    const
        {top, bottom} = element.getBoundingClientRect()//,
        //paddingTop = parseInt(element.style.paddingTop);

   //return {realTop: top + paddingTop, realBottom: bottom};
    return {realTop: top, realBottom: bottom};
}


window.onload = async () => {

    const
        artwork = document.getElementById('artwork'),
        composition = new Composition(artwork, 415, 865),
        {height: headerHeight} = document.querySelector('header').getBoundingClientRect(), //TO DO REMOVE APPLY THE SCROLL TO MAIN
        sections = _.map(
            document.querySelectorAll('section'), (element, index) => {
                const
                    name = element.classList[0]
                    //title = document.querySelector(`nav h2.${name}`);

                return {
                    index,
                    name,
                    //title,
                    element,
                    /*
                    activate() {
                        this.element.classList.add('active');
                        if (this.title) {
                            this.title.classList.add('active');
                            // TODO: create new composition (depending on name)
                        }
                    },
                    deactivate() {
                        this.element.classList.remove('active');
                        if (this.title) {
                            this.title.classList.remove('active');
                            // TODO: clear composition
                        }
                    },
                    */
                };
            });

    let
        //compositionBottom,
        //compositionHeight,
        activeSection = null,
        lastScroll = window.scrollY;


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

    artwork.style.visibility = "hidden"

    // Wait for composition to load
    await Promise.all(p);

    artwork.style.visibility = "visible"

    // Init
    setActiveSection(sections[0]) // TO DO Replace by the URL stuff
    onResize(); onScroll();

    /*
    sections.forEach((section) => {
        const {realTop, realBottom} = getVerticalPosition(section.element);

        if (realTop < compositionBottom && realBottom < window.innerHeight) {
            section.activate();
            activeSection = section;
        }
        else {
            section.deactivate();
        }
    });


    // Controller
    sections.filter((section) => section.title).forEach((section) => {
        section.title.addEventListener('click', () => {
            const {realTop} = getVerticalPosition(section.element);

            Velocity(section.element, 'scroll', {
                offset: compositionHeight,
                duration: Math.abs(headerHeight - realTop),
                easing: 'easeInOutSine',
            });
        });
    });

    document.querySelector('header h1').addEventListener('click', () => {
        Velocity(document.body, 'scroll', {duration: window.scrollY + window.innerHeight, easing: 'easeInOutSine'});
    });
    */

    window.addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()), {passive: true});
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});


    function activateNextSection() {
        setActiveSection(sections[activeSection.index + 1]);
    }

    function activatePreviousSection() {
        setActiveSection(sections[activeSection.index - 1]);
    }

    function setActiveSection(section) {
        activeSection = section;
        // Activate 
        section.element.classList.add('active');

        // Enlighten the nav button
        var title = document.querySelector(`nav h2.${section.id}`);
        if (title != null) {title.classList.add('active');}
    }

    function isEndOfActiveSectionVisible() {
        // check if the bottom of the activesection is above the bottom of the window
        var {top, bottom} = activeSection.element.getBoundingClientRect();
        var isEndOfActiveSectionVisible = bottom < window.innerHeight;
        return isEndOfActiveSectionVisible
    }

    function isEndOfActiveSectionBelowHeader() {
        // check if the bottom of the activesection is above the bottom of the window
        var {top, bottom} = activeSection.element.getBoundingClientRect();
        var isEndOfActiveSectionBelowHeader = bottom < headerHeight;
        return isEndOfActiveSectionBelowHeader
    }

    function isBeginningOfActiveSection() {
        var {top, bottom} = activeSection.element.getBoundingClientRect();
        var isBeginningOfActiveSection = top < (composition.height);
        return isBeginningOfActiveSection
    }

    function getVisibleSectionFromPosition() {
        var sectionsBelow = [];
        sections.forEach((section) => {
            var {top, bottom} = section.element.getBoundingClientRect();
            if ((bottom-headerHeight) > 0) {
                sectionsBelow.push(section);
            }
        });
        return sectionsBelow[0] || sections[sections.length-1];
    }


    function onScroll() {
        /*
        const
            scroll = window.scrollY
            direction = scroll - lastScroll;

        lastScroll = scroll;
        */

        //console.log(getVisibleSectionFromPosition());
        // animate artwork
        composition.animate(_.clamp(window.scrollY / (composition.height/2), 0, 1));

        //const section = activeSection || sections[0];
        const {top, bottom} = activeSection.element.getBoundingClientRect()
        //const {realTop, realBottom} = getVerticalPosition(section.element);
        

        /*
                sections.forEach((section) => {
            var {top, bottom} = section.element.getBoundingClientRect();
            console.log(bottom);
        });

        console.log(activeSection.element);
        console.log("compositionHeight is " + composition.height)
        console.log("headerHeight is " + headerHeight)
        console.log("realTop is " + top);
        console.log("realBottom is " + bottom);
        console.log("scroll is " + window.scrollY);
        console.log("window height is" + window.innerHeight);
        */
        var visibleSection = getVisibleSectionFromPosition()
        if (visibleSection != activeSection) {
            // The last line of the active session is visble we can start bringing back the artwork
           setActiveSection(visibleSection);
           //composition.animate(_.clamp(top / (composition.height/2), 0, 1));
        }
        if (isEndOfActiveSectionVisible()) {
            // The last line of the active session is visble we can start bringing back the artwork
            //console.log("EndOfActiveSectionVisible")
            console.log("isEndOfActiveSectionVisible")
            composition.animate(_.clamp((composition.height-(window.innerHeight-bottom)) / (composition.height/2), 0, 1));
        } else {
            console.log(top)
            composition.animate(_.clamp((composition.height-(top-headerHeight)) / (composition.height/2), 0, 1));
        }
        /*
        if (isBeginningOfActiveSection()) {
            console.log("isBeginningOfActiveSection")
            //composition.animate(_.clamp(top / (composition.height/2), 0, 1));
        }



        /*
        // increase opacity of current section with scrolling
        section.element.style.opacity = _.clamp((compositionBottom - realTop) / composition.height, 0, 1);

        // Detect section change
        if (direction > 0) {
            if (realTop < compositionBottom) {
                if (!activeSection) {
                    section.activate();
                    activeSection = section;
                }
            }
            if (realBottom < headerHeight) {
                section.deactivate();
                activeSection = sections[section.index + 1];
                activeSection.activate();
            }
        }
        else {
            if (realBottom > headerHeight) {
                if (!activeSection) {
                    section.activate();
                    activeSection = section;
                }
            }

            if (realTop > compositionBottom) {
                section.deactivate();
                activeSection = sections[section.index - 1] || null;
                if (activeSection) {
                    activeSection.activate();
                }
            }
        }
        */
    }


    function onResize() {
        composition.rescale();
        document.querySelectorAll('.spacer').forEach((spacer) => {
            console.log(spacer);
            spacer.style.height = `${composition.height}px`;
        });
        document.getElementById('main').style.paddingTop = `${headerHeight}px`;
        /*
        compositionHeight = composition.height;
        compositionBottom = compositionHeight + headerHeight;
        sections.forEach((section) => {
            section.element.style.paddingTop = `${Math.ceil(compositionBottom) + 5}px`;
            if (!section.element.nextElementSibling) {
                section.element.style.paddingBottom = `${Math.ceil(compositionBottom)}px`;
            }
        });
        */
    }
};
