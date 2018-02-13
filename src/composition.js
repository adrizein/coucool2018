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

    resize(scale, t, paysage) {
        if(!paysage){
            //this.element.rotateTo(90);
        }
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
        this._t = 0;
        this._image_height = height_;
        this._image_width = width_;

        //To update with the rescale
        this.update()
    }

    animate(t) {
        this._t = t;
        const scale = this.scale;
        this.images.forEach((image) => image.move(scale, t, this.paysage_mode));
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

    update(){
        this._paysage_mode = (this._anchor.offsetWidth > this._anchor.offsetHeight)
        this._height = this._paysage_mode ? this._image_height : this._image_width;
        this._width = this._paysage_mode ? this._image_width : this._image_height;

        this._image_scale = this._width / this._height;
        this._anchor_scale = this._anchor.offsetWidth / this._anchor.offsetHeight;
        if(this._image_scale >=  this._anchor_scale) {
            // For the same height the image is wider, therefore the width
            this._scaled_height = this._anchor.offsetHeight;
            this._scaled_width = this._scaled_height * this._image_scale;
            this._scale = this._anchor.offsetWidth / this._width;
        } else {
            this._scaled_width = this._anchor.offsetWidth;
            this._scaled_height = this._scaled_width / this._image_scale;
            this._scale = this._anchor.offsetHeight / this._height;

        }

        //this._scale = this._anchor_scale/this._image_scale
    }

    get scale() {
        return this._scale;
        /*
        if (this._image_scale >=  this._anchor_scale) {
            return this._anchor.offsetWidth / this._image_width;
        } else {
            return this._anchor.offsetHeight / this._image_height;
        }
        */
    }

    get paysage_mode() {
        return this._paysage_mode;
    }

    get height() {
        return this._scaled_height;
    }

    get width() {
        return this._scaled_width;
    }

    rescale() {
        this.update();
        const scale = this.scale;
        this.images.forEach((image) => image.resize(scale, this._t, this.paysage_mode));
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
