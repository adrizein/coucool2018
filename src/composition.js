'use strict';

import * as _ from 'lodash';



class LinearTrajectory {

    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    position(scale, t) {
        const
            endX = this.endX + Math.sign(this.endX) * Math.abs(this.offsetX),
            endY = this.endY + Math.sign(this.endY) * Math.abs(this.offsetY);

        return {
            x: scale * this.startX + this.offsetX / 2 + t * (endX - this.startX * scale),
            y: scale * this.startY + this.offsetY / 2 + t * (endY - this.startY * scale),
        };
    }
}

class MovingImage {

    constructor({id, src, zIndex, trajectory, shape}) {
        this.element = new Image();
        this.element.src = src;
        this.element.id = id;
        this.element.style.zIndex = zIndex;
        this._trajectory = trajectory;
        if (shape) {
            this.create_map(shape);
            this.element.useMap = "#" + this._map.name;
            /*
            const area = document.createElement("area");
            area.shape = shape;
            this.area = area;
            */
        }
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

    create_map(shape){
        const map = document.createElement("map");
        map.name = this.element.id + "_map";
        this._map = map;
        
        const area = document.createElement("area");
        area.shape = shape;
        if (shape == "circle") {
            const radius_width = this.element.width/2;
            const radius_height = this.element.height/2;
            area.coords = "0,"+ radius_width + "," + radius_width; //TODO
        }
        area.href = "www.google.com"
        this._map.appendChild(area)

    }


    resize(scale, t, offsetX, offsetY) {
        this.element.height = scale * this.height;
        this.element.width = scale * this.width;
        this._trajectory.offsetX = offsetX;
        this._trajectory.offsetY = offsetY;
        this.move(scale, t);
        if (this.area) {
            if (this.area.shape == "circle"){
                const radius_width = this.element.width/2;
                const radius_height = this.element.height/2;
                this.area.coords = "200,"+ radius_width + "," + radius_width; //TODO
                this.area.height = scale * this.height;
                this.area.width = scale * this.width;
            }
        }
    }

    move(scale, t) {
        const {x, y} = this._trajectory.position(scale, t);
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
    }

    async runAnimation(scale, t, duration) {
        const {x, y} = this._trajectory.position(scale, t);

        return Velocity(this.element, {top: y, left: x}, {
            queue: false,
            duration,
            easing: 'easeInOutSine',
        });
    }
}

class Composition {

    constructor(anchor, height, width, portrait) {
        this.images = [];
        this._anchor = anchor;
        this._t = 0;
        this._height = height;
        this._width = width;
        this._resizing = false;
        this._portrait = portrait;
        this._canvas = document.createElement('div');
        this._anchor.appendChild(this._canvas);
        this.resize();
    }

    animate(t) {
        this._t = t;
        this.images.forEach((image) => image.move(this._scale, this._t));
    }

    async runAnimation(duration, t) {
        this._t = t;

        return Promise.all(this.images.map((image) => image.runAnimation(
            this._scale,
            this._t,
            duration
        )));
    }

    async add(image) {
        this._anchor.appendChild(image.element);
        if(image._map){
            this._anchor.appendChild(image._map);
        }

        this._canvas.appendChild(image.element);
        this.images.push(image);

        return new Promise((resolve) => image.element.addEventListener('load', resolve));
    }

    
    get height() {
        return this._portrait ? this._width : this._height;
    }

    get width() {
        return this._portrait ? this._height : this._width;
    }

    get scaledHeight() {
        return this._scale * this.height;
    }

    get scaledWidth() {
        return this._scale * this.width;
    }

    get scale() {
        return this._scale;
    }

    get t() {
        return this._t;
    }

    get anchor() {
        return this._anchor;
    }

    get heightRatio() {
        return this._anchorHeight / this.height;
    }

    get widthRatio() {
        return this._anchorWidth / this.width;
    }

    resize() {
        const {height, width} = this._anchor.getBoundingClientRect();
        this._anchorHeight = height - 40;
        this._anchorWidth = width;
        this._scale = Math.min(this.heightRatio, this.widthRatio);
        let
            offsetX = Math.floor(this._anchorWidth - this.scaledWidth),
            offsetY = Math.floor(this._anchorHeight - this.scaledHeight) + 40;

        if (this._portrait) {
            [offsetX, offsetY] = [offsetY, offsetX];
        }

        this.images.forEach((image) => {
            image.resize(this._scale, this._t, offsetX, offsetY);
        });
    }

    portrait(duration) {
        this._anchor.classList.add('portrait');
        this._resizing = true;
        this._portrait = true;
        this._resizeComposition();
        setTimeout(() => {this._resizing = false;}, duration);
    }

    landscape(duration) {
        this._anchor.classList.remove('portrait');
        this._resizing = true;
        this._portrait = false;
        this._resizeComposition();
        setTimeout(() => {this._resizing = false;}, duration);
    }

    _resizeComposition() {
        window.requestAnimationFrame(() => {
            this.resize();

            if (this._resizing) {
                this._resizeComposition();
            }
        });
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
