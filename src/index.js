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
    rectangleCuir: {zIndex: 3, startX: 1282, startY: 746, endX: -300, endY: -120},
    rectangleJaune: {zIndex: 1, startX: 0, startY: 703, endX: 2000, endY: 703},
    rectangleOrange: {zIndex: 5, startX: 1174, startY: 47, endX: 1700, endY: 1447},
    triangleRouge: {zIndex: 1, startX: 0, startY: 0, endX: -1300, endY: 0},
};

const exploding_offset = 200;


window.onload = async () => {
    const
        artwork = document.getElementById('artwork'),
        composition = new Composition(artwork, 415, 865),
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
                        var next_index = this.index+1
                        var next_section = next_index < sections.length ? sections[next_index] : null
                        return next_section;
                    },
                    previous() {
                        var previous_index = this.index-1
                        var previous_section = previous_index >=0 ? sections[previous_index] : null
                        return previous_section;
                    }
                };
            });

    let
        previousSection = null,
        activeSection = null;

    // Load composition
    artwork.style.visibility = 'hidden';
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
    // Wait for composition to show the artwork
    await Promise.all(p);
    artwork.style.visibility = 'visible';

    // Events selectors
    window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});
    document.getElementById("main").addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()), {passive: true});
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

    function getSectionByName(section_name) {
        var urlSection = _.find(sections, ({name}) => name === section_name); 
        return  urlSection;
    }

    async function setActiveSection(section) {
        var main = document.getElementById("main");
        if(!activeSection || section.name != activeSection.name) {
            section.title.classList.add('active');
            if(activeSection){
                activeSection.title.classList.remove('active');
                console.log(document.getElementById("main").scrollTop);
                await Velocity(activeSection.element, 'scroll', {
                        container: main,
                        duration: 1000, 
                        easing: "ease-in"});
                activeSection.element.classList.remove('active');
            }
            section.element.classList.add('active');
            //section.hide();
            activeSection = section;
            window.location.hash = section.name;

            setTimeout(function () {
                console.log(document.getElementById("main").scrollTop);
                console.log(document.getElementById("main").scrollTop == 0);
                if (document.getElementById("main").scrollTop == 0) {
                    Velocity(section.element, 'scroll', {
                        offset:exploding_offset,
                        container: document.getElementById("main"),
                        duration: 1000, 
                        easing: "ease-in"});
                    }
            }, 1000);
        }
    }

    async function scrollToTop(duration){
        // TO DO SLOWLY SCROLL BACK TO TOP OF MAIN
        //await composition.runAnimation(duration, 0); 
        //document.getElementById("main").scrollTop = 0

        console.log('Pouet');
        
        console.log('Waited for 5 secs');
        /*
        Velocity(document.getElementById("main"), 'scroll', {
                queue: false,
                offset: 200,
                duration: 1000,
                easing: 'easeInOutSine',
            })
        */
    }

    function onScroll() {

        var main = document.getElementById("main");
        var chevron = document.getElementById("chevron");

        if (main.scrollTop==0){
            chevron.style.display = "block";
        } else {
            chevron.style.display = "none";
        }

        //console.log("scrolltop " + main.scrollTop);
        //console.log("innerHeight " + main.innerHeight);
        //console.log("scrollHeight " + main.scrollHeight);
        
        // Explosion
        // TO DO FAIRE MARCHER CE PUTAIN DE PADDING TOP ET LE VIRER SUR SECTION DANS LE CSS
        // activeSection.element.style['paddingTop'] = main.innerHeight;
        //console.log("paddingTop " + activeSection.element.style['paddingTop']);
        var t = Math.clamp(main.scrollTop / exploding_offset, 0, 1)
        composition.animate(t)
        activeSection.element.style.opacity = Math.clamp(t*3, 0, 1);

        /*
        if (main.scrollTop + main.offsetHeight >= main.scrollHeight){
            // SETACTIVESECTION(ACTIVESECTION.NEXT)
            console.log(activeSection.next());
        }
        */
        // if scroll to top set active session to previous
    }

    function onResize() {
        composition.rescale();
        /*
        _.map(
            document.querySelectorAll('section'), (element, index) => {
                console.log(element);
                element.style.marginBottom = document.getElementById("main").innerHeight + exploding_offset;
               }
        ); 
        */               
    }

    function onHash() {
        if (window.location.hash.length > 1) {
            const urlSection = getSectionByName(window.location.hash.replace('#', '')) //_.find(sections, ({name}) => name === window.location.hash.replace('#', ''));
            if (urlSection) {
                setActiveSection(urlSection);
            } 
        } else {
                setActiveSection(getSectionByName("ethos"));
        }
    }
};
