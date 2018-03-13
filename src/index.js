'use strict';

import './style.css';
import * as compositionImages from './images/composition';
import redLine from './images/red-line.png';
import {Composition, MovingImage, LinearTrajectory} from './composition';


const movingImages = {
    bigRedTriangle: {zIndex: 2, startX: 92, startY: 39, endX: 1500, endY: 39},
    blackHalfCircle: {zIndex: 5, startX: 677, startY: 39, endX: 677, endY: -180},
    blueHair: {zIndex: 3, startX: 778, startY: 358, endX: 778, endY: -200},
    bluePillLeft: {zIndex: 1, startX: 150, startY: 481, endX: 1400, endY: -100},
    blueRectangleCenterRight: {zIndex: 2, startX: 675, startY: 357, endX: 675, endY: 860},
    blueRectangleTop: {zIndex: 6, startX: 663, startY: 104, endX: 663, endY: 850},
    blueRectangleTopLeft: {zIndex: 0, startX: 181, startY: 157, endX: 181, endY: -230},
    centerCircle: {zIndex: 4, startX: 545, startY: 127, endX: 0, endY: -350,
        eventGeneratingShape: 'circle',
        title: 'Facebook',
        onClick() {
            window.open('http://www.facebook.com/coucoolcoucool', '_blank');
        },
    },
    featherCircle: {zIndex: 1, startX: 214, startY: 217, endX: -150, endY: -150},
    fingers: {zIndex: 1, startX: 191, startY: 482, endX: 191, endY: 900,
        eventGeneratingShape: 'circle',
        title: 'Eros',
        section: 'eros',
    },
    greenCircle: {zIndex: 1, startX: 589, startY: 282, endX: 1589, endY: 1282,
        eventGeneratingShape: 'circle',
        title: 'Definitions',
        section: 'definitions',
    },
    greenRectangleTopLeft: {zIndex: 1, startX: 243, startY: 129, endX: 1400, endY: 800},
    orangeRectangleCenter: {zIndex: 1, startX: 245, startY: 422, endX: -400, endY: 900},
    palmTree: {zIndex: 0, startX: 416, startY: 542, endX: 417, endY: 1042},
    photocopySmallLeft: {zIndex: 0, startX: 246, startY: 462, endX: -200, endY: 280},
    photocopyShapeTopRight: {zIndex: 2, startX: 627, startY: 238, endX: 100, endY: -200},
    pillCenterRight: {zIndex: 5, startX: 465, startY: 336, endX: -200, endY: 336},
    redRectangleTopRight: {zIndex: 3, startX: 964, startY: 227, endX: 364, endY: -30},
    smallBlackRectangleCenter: {zIndex: 1, startX: 778, startY: 539, endX: 1400, endY: 542},
    textureRectangleCenter: {zIndex: 2, startX: 417, startY: 301, endX: -360, endY: 100},
    woodTriangle: {zIndex: 2, startX: 245, startY: 423, endX: 775, endY: 853,
        eventGeneratingShape: 'poly',
        title: 'Coucool 2016',
        onClick() {
            window.open('http://cou.cool/2016', '_blank');
        },
    },
    yellowRectangleCenter: {zIndex: 1, startX: 685, startY: 357, endX: 1400, endY: 359,
        eventGeneratingShape: 'rect',
        title: 'Coucool 2017',
        onClick() {
            window.open('http://cou.cool/2017', '_blank');
        },
    },
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
        chevron = document.getElementById('chevron'),
        credit = document.getElementById('credit'),
        texts = document.getElementsByClassName('text'),
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
        manualScroll = false;

    // Events selectors
    window.addEventListener('resize', () => onResize(), {passive: true});

    if (/Firefox/i.test(navigator.userAgent)) {
        main.style.overflowY = 'hidden';
        window.addEventListener('DOMMouseScroll', (event) => {
            main.scrollTop += event.detail * 15;
        }, {passive: true});
    }

    main.addEventListener('scroll', () => onScroll(), {passive: true});
    window.onhashchange = onHash;
    window.onorientationchange = async () => {
        await frame();
        await onResize();
        await onScroll();
    };
    main.onblur = function onBlur() {this.focus();};

    _.forEach(document.querySelectorAll('nav h2'), (element) => {
        const line = new Image();
        line.src = redLine;
        element.appendChild(line);
        const w = _.max(_.map(element.querySelectorAll('span'), (e) => e.getBoundingClientRect().width)) * 1.1;
        line.style.width = `${w}px`;
        line.style.left = `calc(50% - ${w / 2}px)`;
    });

    _.forEach(document.querySelectorAll('h2, .link'), (element) => {
        element.addEventListener('click', (event) => {
            manualScroll = false;
            main.classList.add('no-scroll');
            const section = _.find(sections, (s) => event.currentTarget.classList.contains(s.name));
            if (section) {
                setActiveSection(section);
            }
            else {
                console.error('Should not happen, bad section name:', event.currentTarget.className);
            }
        });
    });

    _.forEach(document.querySelectorAll('.yes'), (element) => {
        element.addEventListener('click', (event) => {
            fadeContributionPage(event.target);
        });
    });

    _.forEach(document.querySelectorAll('input'), (element) => {
        element.addEventListener('click', (event) => {
            fadeContributionPage(event.target);
        });
    });

    _.forEach(document.querySelectorAll('#language span'), (element) => {
        element.addEventListener('click', () => {
            if (element.id !== document.documentElement.lang) {
                setActiveSection(activeSection, true, element.id);
            }
        });
    });

    _.forEach(document.querySelectorAll('.accordion-item'), (element) => {
        element.addEventListener('click', async () => {
            openAccordion(element);
        });
    });

    _.forEach(document.querySelectorAll('.accordion-item'), (element) => {
        element.addEventListener('mouseenter', () => {
            closeAccordions(element.parentElement, element);
            openAccordion(element);
        });
    });

    _.forEach(document.querySelectorAll('.accordion-item'), (element) => {
        element.addEventListener('mouseleave', () => {
            closeAccordion(element);
        });
    });

    init();

    ////////////


    async function init() {
        // set language
        const [initialSection, language] = getSectionAndLanguage();
        document.documentElement.lang = language;

        // Load composition
        const p = [];
        _.forEach(
            movingImages,
            ({zIndex, startX, startY, endX, endY, eventGeneratingShape, title, onClick, section}, name) => {
                if (section) {
                    const s = getSectionByName(section);
                    onClick = () => setActiveSection(s, false);
                }

                const image = new MovingImage(
                    {
                        id: _.kebabCase(name),
                        src: compositionImages[name],
                        zIndex,
                        trajectory: new LinearTrajectory(startX, startY, endX, endY),
                        shape: eventGeneratingShape,
                        title,
                        onClick,
                    },
                );

                p.push(composition.add(image));
            });

        // Wait for composition to show the artwork
        await Promise.all(p);

        // remove loader
        loader.classList.add('exit');
        onResize();
        await frame();
        loader.remove();
        await frame();
        main.scrollTo = 0; // remove the slight offset when the loader is removed

        // initialize the composition in its exploded form
        composition.animate(1);
        chevron.classList.add('hidden');
        container.classList.add('loading');
        container.classList.add('visible');
        await composition.runAnimation(2000, 0);
        chevron.classList.remove('hidden');
        chevron.classList.add('blink');
        await setActiveSection(initialSection, false, language);
        await pause(7000);
        chevron.classList.remove('blink');
        await pause(4000);
        container.classList.remove('loading');
        container.classList.add('loaded');
        await frame();

        if (autoScroll) {
            return scrollToSection();
        }
    }

    function getSectionByName(sectionName) {
        return _.find(sections, ({name}) => name === sectionName);
    }

    async function setActiveSection(section, scroll = true, lang) {
        onResize();

        lang = lang || document.documentElement.lang;
        const languageChanged = lang !== document.documentElement.lang;
        const sectionChanged = !activeSection || section.name !== activeSection.name;

        if (!switching) {
            let delayBeforeScrollingDown = 4000;
            switching = true;
            autoScroll = false;
            window.location.hash = `/${lang}/${section.name}`;
            await frame();

            if (sectionChanged) {
                //highlight title
                sections.forEach((s) => {
                    if (s.title) {
                        if (s.name !== section.name) {
                            s.title.classList.remove('active');
                        }
                    }
                });
                if (section.title) {
                    section.title.classList.add('active');
                }
            }

            // quit previous section
            if (activeSection) {
                chevron.classList.add('hidden');
                credit.classList.add('hidden');

                if (languageChanged) {
                    container.classList.add('loading');
                    container.classList.remove('loaded');
                    fadeOutTexts();
                }

                if (languageChanged || sectionChanged) {
                    const duration = 1000;
                    if (main.scrollTop > 0) {
                        // Implode if we changed the section or language
                        await Promise.all([
                            composition.runAnimation(duration, 0),
                            Velocity(artwork, {opacity: 1}, {duration, queue: false}),
                            Velocity(activeSection.element, {opacity: 0}, {duration, queue: false}),
                        ]);
                        main.scrollTop = 0;
                    }
                    else {
                        await composition.runAnimation(duration * 0.6, 0.6);
                        await composition.runAnimation(duration * 0.6, 0);
                        onScroll();
                    }

                    activeSection.element.classList.remove('active');
                    await frame();
                }
                else {
                    // do not wait before scrolling
                    delayBeforeScrollingDown = 0;
                }

                if (languageChanged) {
                    container.classList.remove('loading');
                    container.classList.add('loaded');
                    fadeInTexts();
                    document.documentElement.lang = lang;
                }
            }

            // Set the new section
            activeSection = section;
            activeSection.element.classList.add('active');
            chevron.classList.remove('hidden');
            credit.classList.remove('hidden');
            main.classList.remove('no-scroll');
            manualScroll = true;
            await frame();

            switching = false;
            sections.forEach((s) => {
                if (s.name !== section.name) {
                    if (s.title) {
                        s.title.classList.remove('inactive');
                    }
                }
            });

            await frame();

            if (activeSection.name === 'contributions') {
                main.style.top = '0px';
                main.style.bottom = '0px';
            }
            else {
                main.style.top = '20px';
                main.style.bottom = '20px';
            }

            if (activeSection.name === 'curiosites') {
                artwork.style.zIndex = '5';
                chevron.style.display = 'none';
                credit.style.display = 'none';
            }
            else {
                // scroll automatically if nothing happens (no click, no manual scroll)
                autoScroll = true;
                chevron.style.display = null;
                credit.style.display = null;
                artwork.style.zIndex = '2';
                if (scroll) {
                    await pause(delayBeforeScrollingDown);

                    if (autoScroll) {
                        return scrollToSection();
                    }
                }
            }
        }
    }

    async function onScroll() {
        if (main.scrollTop === 0) {
            chevron.classList.remove('hidden');
            credit.classList.remove('hidden');
            chevron.classList.add('blink');
        }
        else {
            chevron.classList.add('hidden');
            chevron.classList.remove('blink');
            credit.classList.add('hidden');
        }

        if (manualScroll) {
            autoScroll = false;
            container.classList.remove('loading');
            container.classList.add('loaded');
            if (!composition.running) {
                const
                    s = main.scrollTop / main.scrollHeight,
                    t = Math.sin(main.scrollTop / 400) * composition.scale;

                await frame();
                composition.animate(t);
                artwork.style.opacity = Math.clamp(1 - main.scrollTop / composition.scaledHeight, 0.3, 1);
                activeSection.element.style.opacity = Math.clamp(s * 10, 0, 1);
            }
        }
    }

    async function onResize() {
        composition.resize();
        composition.resumeAnimation();
        await frame();

        const {width: w, height: h} = document.body.getBoundingClientRect();

        if (w < h) {
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

        sections.forEach(({element}) => {
            element.style.paddingTop = `${composition.scaledHeight}px`;
        });
    }

    async function onHash() {
        // avoid the onHash handler from being called during the setActiveSection() call
        if (!switching) {
            const [section, lang] = getSectionAndLanguage();

            return setActiveSection(section, true, lang);
        }
    }

    function getSectionAndLanguage() {
        if (window.location.hash.length > 1) {
            const urlSection = window.location.hash.substr(1);
            if (urlSection) {
                const parts = urlSection.split('/').splice(1);
                let lang, section;
                if (['fr', 'en'].includes(parts[0])) {
                    lang = parts[0];
                    section = getSectionByName(parts[1]) || activeSection || getSectionByName('ethos');
                }
                else {
                    section = getSectionByName(parts[0]);
                }

                return [section || activeSection || getSectionByName('ethos'), lang || document.documentElement.lang];
            }
        }

        return [activeSection || getSectionByName('ethos'), document.documentElement.lang];
    }

    async function fadeContributionPage(element) {
        let parentContributionPage = element;
        while (parentContributionPage) {
            if (parentContributionPage.classList.contains('contribution-page')) {
                break;
            }
            parentContributionPage = parentContributionPage.parentNode;
        }
        const nextPageNumber = parseInt(parentContributionPage.id.slice(-1)) + 1;
        const nextId = parentContributionPage.id.slice(0, -1) + nextPageNumber;
        const nextPage = document.getElementById(nextId);

        //We append the weezevent div if the next page contains the weezevent-visble class
        //This is to avoid to have 2 weezevent div in the page which makes it blink
        var nextPageDisplay = 'flex';
        if (nextPage.classList.contains('weezevent-visible')){
            var weez = document.getElementById("weezevent")
            nextPage.append(weez);
            nextPageDisplay = 'block';
        }


        await Velocity(parentContributionPage, 'fadeOut', {
            duration: 200,
            easing: 'ease-in',
            queue: false,
        });

        await Velocity(nextPage, 'fadeIn', {
            display: nextPageDisplay,
            duration: 200,
            easing: 'ease-in',
            queue: false,
        });
    }

    async function scrollToSection() {
        return Velocity(activeSection.element, 'scroll', {
            offset: activeSection.element.style.paddingTop,
            container: main,
            duration: 1000,
            easing: 'ease-in',
            queue: false,
        });
    }

    async function openAccordion(element) {
        if (!element.classList.contains('active')) {
            element.classList.add('active');
            await Velocity(element.lastElementChild, 'stop');
            return Velocity(
                element.lastElementChild,
                {height: element.lastElementChild.scrollHeight},
                {queue: false, duration: 5 * element.lastElementChild.scrollHeight}
            );
        }
    }

    async function closeAccordion(element, force) {
        if (element.classList.contains('active') || force) {
            element.classList.remove('active');
            await Velocity(element.lastElementChild, 'stop');
            return Velocity(
                element.lastElementChild,
                {height: 0},
                {queue: false, duration: 5 * element.lastElementChild.scrollHeight}
            );
        }
    }

    async function closeAccordions(parent, element) {
        return Promise.all(_.map(parent.children, (e) => {
            if (e !== element) {
                return closeAccordion(e, true);
            }
        }));
    }

    async function fadeInTexts() {
        _.forEach(texts, (e) => e.classList.add('visible'));

        return pause(1000);
    }

    async function fadeOutTexts() {
        _.forEach(texts, (e) => e.classList.remove('visible'));
    }
};

async function frame() {
    return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function pause(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}
