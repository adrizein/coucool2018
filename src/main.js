'use strict';

window.onload = function() {
    const
        main = document.getElementById('main'),
        images = [];

    const targets = {
        cercle_central: {x: 0, y: 0},
        demi_cercle_haut: {x: 0, y: 0},
        pilule: {x: 0, y: 0},
        rectangle_bicolore: {x: 0, y: 0},
        rectangle_centre: {x: 0, y: 0},
        rectangle_cuir: {x: 0, y: 0},
        rectangle_jaune: {x: 0, y: 0},
        rectangle_orange: {x: 0, y: 0},
        triangle_rouge: {x: 0, y: 0},
    };


    for (const name in targets) {
        var element = document.getElementById(name);
        images.push({
            element: element,
            trajectory: makeLineTrajectory(
                element.getBoundingClientRect(),
                targets[name]
            ),
        });
    }

    var maxScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    document.addEventListener('scroll', function (event) {
        const t = window.scrollY / maxScrollY;
        images.forEach(function (element) {
            element.trajectory(t);
        })
    });
};


function makeLineTrajectory(start, end) {
    return function (t) {
        const
            x = (end.x - start.x) * t + start.x,
            y = (end.y - start.y) * t + start.y;

        const self = this;
        window.requestAnimationFrame(function () {
            self.element.style.left = x + 'px';
            self.element.style.top = y + 'px';
        })
    };
}


function imageLoaded(event) {
    const match = event.srcElement.src.match(/(\w+)_lowres\.(png|jpg)$/);
    if (match) {
        const name = match[1];
        event.srcElement.src = '../assets/'+name+'.png';
    }
}
