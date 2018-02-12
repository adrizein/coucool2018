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
                    id = element.id
                    //title = document.querySelector(`nav h2.${name}`);

                return {
                    index,
                    name,
                    element
                };
            });

    let activeSection = null

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
    onResize(); 

    // Events selectors
    window.addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()), {passive: true});
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});

    var divs = document.querySelectorAll('nav h2');
    [].forEach.call(divs, function(div) {
        div.addEventListener('click', (event) => {
            var section = getSectionById(event.target.classList[0])
            setActiveSection(section);
            goToActiveSection();
        });
    });



    function goToActiveSection() {
        // TO DO change to remove all the other section before scrolling
        Velocity(activeSection.element, 'scroll', {
            offset: -(headerHeight+composition.height-1),
            //duration: Math.abs(headerHeight - sectionElement.getBoundingClientRect().top),
            easing: 'easeInOutSine',
        });
    }

    function getSectionById(sectionId) {
        var matchingSections = []
        sections.forEach((section) => {
            if (section.element.id == sectionId) {
                matchingSections.push(section);
            }
        });
        return matchingSections[0];
    }

    function setActiveSection(section) {
        activeSection = section;
        //Remove the active class everywhere
        var divs = document.querySelectorAll('.active');
        [].forEach.call(divs, function(div) {
            div.classList.remove('active');
        });

        //Set the opacity to 0 in every section
        sections.forEach((section) => {
            section.element.style.opacity = 0
        });
        
        // Activate the section
        section.element.classList.add('active');
        // Enlighten the nav button
        var title = document.querySelector(`nav h2.${section.element.id}`);
        if (title != null) {title.classList.add('active');}
    }

    function isEndOfActiveSectionVisible() {
        // check if the bottom of the activesection is above the bottom of the window
        var isEndOfActiveSectionVisible = activeSection.element.getBoundingClientRect().bottom < window.innerHeight;
        return isEndOfActiveSectionVisible
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


    function explode(beginningTop) {
        var heightOfExplosion = composition.height/2;
        composition.animate(_.clamp((beginningTop - activeSection.element.getBoundingClientRect().top)/ heightOfExplosion, 0, 1));
    }

    function implode(endBottom) {
        var heightOfExplosion = composition.height/2;
        composition.animate(_.clamp((activeSection.element.getBoundingClientRect().bottom - endBottom)/ heightOfExplosion, 0, 1));
    }

    function onScroll() {

        const {top, bottom} = activeSection.element.getBoundingClientRect()
        
        // Remove footer
        if (window.scrollY == 0) {
            document.querySelectorAll('footer').forEach((footer) => {
                footer.style.display = "flex";
            }); 
        } else {
           document.querySelectorAll('footer').forEach((footer) => {
                footer.style.display = "none";
            });
        }

        //Remove chevron
        if (top < headerHeight+composition.height+10 &&
            top > headerHeight+composition.height-10) {
            document.getElementById('chevron').style.display = "block"
        } else {
           document.getElementById('chevron').style.display = "none" 
        }

        // increase opacity of current section with scrolling
        activeSection.element.style.opacity = _.clamp((composition.height + headerHeight - top) / composition.height, 0, 1);

        //Implode and Explode
        if (isEndOfActiveSectionVisible()) {
            implode(headerHeight);
        } else {
            explode(composition.height+headerHeight);
        }

        //Change active section
        var visibleSection = getVisibleSectionFromPosition()
        if (visibleSection != activeSection) {
           setActiveSection(visibleSection);
        }

    }


    function onResize() {
        composition.rescale();
        document.querySelectorAll('.spacer').forEach((spacer) => {
            spacer.style.height = `${composition.height}px`;
        });
        document.getElementById('main').style.paddingTop = `${headerHeight}px`;
    }
};
