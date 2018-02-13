'use strict';

import * as _ from 'lodash';



class LinearTrajectory {

    constructor(startX, startY, endX, endY) {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;
    }

    position(scale, t) {
        return {
            x: scale * (this._startX + t * (this._endX - this._startX)),
            y: scale * (this._startY + t * (this._endY - this._startY)),
        };
    }
}

class MovingImage {

    constructor({id, src, zIndex, trajectory}) {
        this.element = new Image();
        this.element.src = src;
        this.element.id = id;
        this.element.style.zIndex = zIndex;
        this._trajectory = trajectory;
    }

    get height() {
        return this.element.naturalHeight;
    }

    get width() {
        return this.element.naturalWidth;
    }

    get id() {
        return this.element.id;
    }

    get image() {
        return this.element.src;
    }

    set image(src) {
        this.element.src = _.get(src, 'src') || src;
    }

    resize(scale, t) {
        this.element.height = scale * this.height;
        this.element.width = scale * this.width;

        this.move(scale, t);
    }

    move(scale, t) {
        const {x, y} = this._trajectory.position(scale, t);
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
    }

    runAnimation(scale, duration, t) {
        const {x, y} = this._trajectory.position(scale, t);

        return Velocity(this.element, {top: y, left: x}, {
            queue: false,
            duration,
            easing: 'easeInOutSine',
        });
    }
}

class Composition {

    constructor(anchor, height_, width_) {
        this.images = [];
        this._anchor = anchor;
        this._height = height_;
        this._width = width_;
        this._t = 0;
        this.scale = this._scale;
    }

    animate(t) {
        this._t = t;
        this.images.forEach((image) => image.move(this.scale, t));
    }

    async runAnimation(duration, t) {
        this._t = t;

        return Promise.all(this.images.map((image) => image.runAnimation(this.scale, duration, t)));
    }

    async add(image) {
        this._anchor.appendChild(image.element);
        this.images.push(image);

        return new Promise((resolve) => image.element.addEventListener('load', resolve));
    }

    get _scale() {
        return this._anchor.offsetWidth / this._width;
    }

    get height() {
        return this._height * this.scale;
    }

    get width() {
        return this._width * this.scale;
    }

    rescale() {
        this.scale = this._scale;

        this.images.forEach((image) => image.resize(this.scale, this._t));
    }

    clear() {
        while (this.images.length) {
            const image = this.images.pop();
            this._anchor.removeChild(image.element);
        }
    }
}

export {
    MovingImage,
    Composition,
    LinearTrajectory,
};
