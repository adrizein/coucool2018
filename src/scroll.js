class ScrollController {

    constructor(composition) {
        this._composition = composition;
    }
}

/*
const
    artwork = document.getElementById('artwork'),
    composition = new Composition(artwork, 415, 865),
    //TODO: REMOVE and APPLY THE SCROLL TO MAIN
    {height: headerHeight} = document.querySelector('header').getBoundingClientRect(),
    sections = _.map(
        document.querySelectorAll('section:not(.hidden)'), (element, index) => {
            const
                name = element.id;
            //title = document.querySelector(`nav h2.${name}`);

            return {
                index,
                name,
                element,
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

// Init
setActiveSection(sections[0]);
onResize(); onHash();

// Events selectors
//window.addEventListener('scroll', () => window.requestAnimationFrame(() => onScroll()), {passive: true});
window.addEventListener('resize', () => window.requestAnimationFrame(() => onResize()), {passive: true});
window.onhashchange = onHash;

const divs = document.querySelectorAll('nav h2');
[].forEach.call(divs, (div) => {
    div.addEventListener('click', (event) => {
        const section = getSectionById(event.target.classList[0]);
        console.log(section);
        setActiveSection(section);
        goToActiveSection();
    });
});


function onHash() {
    if (window.location.hash.length > 1) {
        const urlSection = _.find(sections, ({name}) => name === window.location.hash.replace('#', ''));
        if (urlSection) {
            setActiveSection(urlSection);
            goToActiveSection();
        }
    }
}

async function goToActiveSection() {
    _.filter(sections, (section) => previousSection !== section).forEach((section) => {
        section.element.style.display = 'none';
    });
    activeSection.element.style.display = null;
    previousSection.element.style.display = null;

    if (previousSection !== activeSection) {
        if (previousSection) {
            await Promise.all([
                Velocity(previousSection.element, {opacity: 0}, {
                    queue: false,
                    duration: 1000,
                    easing: 'easeInOutSine',
                }),
                composition.runAnimation(1000, 0),
            ]);
        }

        await Promise.all([
            Velocity(activeSection.element, {opacity: 1}, {
                queue: false,
                duration: 1000,
                easing: 'easeInOutSine',
            }),
            composition.runAnimation(1000, 1),
        ]);
    }
    else {
        let p = Promise.resolve();
        if (parseFloat(activeSection.element.opacity) !== 1) {
            p = Velocity(activeSection.element, {opacity: 1}, {
                queue: false,
                duration: 1000,
                easing: 'easeInOutSine',
            });
        }
        await Promise.all([
            Velocity(activeSection.element, 'scroll', {
                queue: false,
                offset: -headerHeight,
                duration: 1000,
                easing: 'easeInOutSine',
            }),
            p,
            composition.runAnimation(1000, 1),
        ]);
    }

    sections.forEach((section) => {
        section.element.style.display = null;
    });
}

function getSectionById(sectionId) {
    const matchingSections = [];
    sections.forEach((section) => {
        if (section.name === sectionId) {
            matchingSections.push(section);
        }
    });

    return matchingSections[0];
}

function setActiveSection(section) {
    previousSection = activeSection;
    activeSection = section;
    //Remove the active class everywhere
    const divs = document.querySelectorAll('.active');
    [].forEach.call(divs, (div) => {
        div.classList.remove('active');
    });

    //Set the opacity to 0 in every section
    sections.forEach((s) => {
        s.element.style.opacity = 0;
    });

    // Activate the section
    section.element.classList.add('active');

    // Enlighten the nav button
    const title = document.querySelector(`nav h2.${section.name}`);
    if (title) {
        title.classList.add('active');
    }
}

function isEndOfActiveSectionVisible() {
    // check if the bottom of the activesection is above the bottom of the window
    return activeSection.element.getBoundingClientRect().bottom < window.innerHeight;
}

function getVisibleSectionFromPosition() {
    const sectionsBelow = [];
    sections.forEach((section) => {
        const {bottom} = section.element.getBoundingClientRect();
        if (bottom - headerHeight > 0) {
            sectionsBelow.push(section);
        }
    });
    return sectionsBelow[0] || sections[sections.length - 1];
}


function explode(beginningTop) {
    const heightOfExplosion = composition.height / 2;
    composition.animate(_.clamp(
        (beginningTop - activeSection.element.getBoundingClientRect().top) / heightOfExplosion, 0, 1)
    );
}

function implode(endBottom) {
    const heightOfExplosion = composition.height / 2;
    composition.animate(
        _.clamp((activeSection.element.getBoundingClientRect().bottom - endBottom) / heightOfExplosion, 0, 1)
    );
}

function onScroll() {
    const {top} = activeSection.element.getBoundingClientRect();

    // Remove footer
    const footer = document.querySelector('footer');
    if (window.scrollY === 0) {
        footer.style.display = null;
    }
    else {
        footer.style.display = 'none';
    }

    // Remove chevron
    const chevron = document.getElementById('chevron');
    if (top < headerHeight + composition.height + 10 &&
        top > headerHeight + composition.height - 10) {
        chevron.style.display = null;
    }
    else {
        chevron.style.display = 'none';
    }

    // increase opacity of current section with scrolling
    activeSection.element.style.opacity = _.clamp((
        composition.height + headerHeight - top) / composition.height, 0, 1);

    //Implode and Explode
    if (isEndOfActiveSectionVisible()) {
        implode(headerHeight);
    }
    else {
        explode(composition.height + headerHeight);
    }

    //Change active section
    const visibleSection = getVisibleSectionFromPosition();

    if (visibleSection !== activeSection) {
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
*/
