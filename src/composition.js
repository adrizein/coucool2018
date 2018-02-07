'use strict';

import * as _ from 'lodash';



class LinearTrajectory {

    constructor(x_i, y_i, x_f, y_f) {
        this._xi = x_i;
        this._yi = y_i;
        this._xf = x_f;
        this._yf = y_f;
    }

    position(scale, t) {
        return {
            x:scale * (this._xi + t * (this._xf - this._xi)),
            y:scale * (this._yi + t * (this._yf - this._yi)),
        }
    }
}

class MovingImage {

    constructor({id, src, z_index, trajectory}) {
        this.element = new Image();
        this.element.src = src;
        this.element.id = id;
        this.element.style.zIndex = z_index;
        this._trajectory = trajectory;

        this.element.onload = () => {
            this._height = this.height;
            this._width = this.width;
            this.element.onload = null;
        };
    }

    get height() {
        return this.element.height;
    }

    get width() {
        return this.element.width;
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

    move(scale, t) {
        const {x, y} = this._trajectory.position(scale, t);
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
    }

    resize(scale) {
        this.element.height = scale * this._height;
        this.element.width = scale * this._width;
    }

    rescale(scale, t) {
        this.resize(scale);
        this.move(scale, t);
    }
}

class Composition {

    constructor(anchor, height_, width_) {
        this._images = [];
        this._anchor = anchor;
        this._height = height_;
        this._width = width_;
        this._t = 0;
    }

    animate(t) {
        this._t = t;
        window.requestAnimationFrame(() => {
            this._images.forEach((image) => {
                image.move(this.scale, t);
            });
        });
    }

    add(image) {
        this._anchor.appendChild(image.element);
        this._images.push(image);
        image.element.addEventListener('load', () => {
            image.rescale(this.scale, this._t);
        });
    }

    get scale() {
        const {height, width} = this._anchor.getBoundingClientRect();
        return _.min([height / this._height, width / this._width]);
    }

    rescale() {
        const scale = this.scale;
        this._images.forEach((image) => {
            image.rescale(this.scale, this._t);
        });
    }
}

export {
    MovingImage,
    Composition,
    LinearTrajectory,
};
