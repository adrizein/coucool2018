'use strict';

import * as _ from 'lodash';



class LinearTrajectory {

    constructor(startX, startY, endX, endY) {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;
    }

    position(composition) {
        return {
            // We want them to explode further
            x: composition.padding_width + composition.scale * (this._startX + composition.t * (2*this._endX - this._startX)),
            y: composition.padding_height + composition.scale * (this._startY + composition.t * (2*this._endY - this._startY)),
            /*
            x: composition.padding_width + composition.scale * (this._startX + composition.t * (this._endX - this._startX)),
            y: composition.padding_height + composition.scale * (this._startY + composition.t * (this._endY - this._startY)),
            */
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

    resize(composition) {
        if(!this.paysage_mode){
            //this.element.rotateTo(90);
        }
        this.element.height = composition.scale * this.height;
        this.element.width = composition.scale * this.width;
        this.move(composition);
    }

    move(composition) {
        //console.log(composition.t);
        //console.log(composition.scale);
        const {x, y} = this._trajectory.position(composition);
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
    }

    runAnimation(composition, duration) {
        const {x, y} = this._trajectory.position(composition);

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
        this.images.forEach((image) => image.move(this));
    }

    async runAnimation(duration, t) {
        this._t = t;
        return Promise.all(this.images.map((image) => image.runAnimation(this, duration)));
    }

    async add(image) {
        this._anchor.appendChild(image.element);
        this.images.push(image);

        return new Promise((resolve) => image.element.addEventListener('load', resolve));
    }

    update(){
        //We dont want the composition to take the whole anchor
        const padding_height = 40;
        const padding_width = 40;

        this.composition_frame_width = this._anchor.offsetWidth-2*padding_width;
        this.composition_frame_height = this._anchor.offsetHeight-2*padding_height;

        //console.log(this.composition_frame_width);
        //console.log(this.composition_frame_height);
        //TO_DO ROTATE THE ARTWORK ON MOBILE
        this._paysage_mode = true;//(this.composition_frame_width > this.composition_frame_height)
        this._height = this._paysage_mode ? this._image_height : this._image_width;
        this._width = this._paysage_mode ? this._image_width : this._image_height;

        this._image_scale = this._width / this._height;
        this._anchor_scale = this.composition_frame_width / this.composition_frame_height;
        if(this._image_scale >=  this._anchor_scale) {
            this._scale = this.composition_frame_width / this._width;

            this._scaled_width = this.composition_frame_width;
            this._scaled_height = this._scaled_width / this._image_scale;
            this.padding_height = padding_height + (this.composition_frame_height - this._scaled_height)/2
            this.padding_width = padding_width;

        } else {
            this._scale = this.composition_frame_height / this._height;

            this._scaled_height = this.composition_frame_height;
            this._scaled_width = this._scaled_height * this._image_scale;
            this.padding_width = padding_width + (this.composition_frame_width - this._scaled_width)/2
            this.padding_height =padding_height;
        }
        //
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

    get t() {
        return this._t;
    }

    get paysage_mode() {
        return this._paysage_mode;
    }

    rescale() {
        this.update();
        const scale = this.scale;
        this.images.forEach((image) => image.resize(this));
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
