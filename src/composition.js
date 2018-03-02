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
            this.createMap(shape);
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

    createMap(shape){
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
            if (this.area.shape === "circle"){
                const radius_width = this.element.width / 2;
                const radius_height = this.element.height / 2;
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

    async runAnimation(scale, t, duration, progress) {
        const {x, y} = this._trajectory.position(scale, t);

        return Velocity(this.element, {top: y, left: x}, {
            queue: false,
            duration,
            easing: 'easeInOutSine',
            progress(elements, completion) {
                if (progress) {
                    progress(completion);
                }
            },
        });
    }

    stopAnimation() {
        Velocity(this.element, 'stop');
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
        if (!this._running) {
            this._running = true;
            const oldT = this._t;
            await Promise.all(this.images.map((image) => image.runAnimation(
                this._scale,
                t,
                duration,
                (completion) => {this._t = (t - oldT) * completion + oldT;}
            )));

            this._running = false;
            return true;
        }
        else {
            return false;
        }
    }

    stopAnimation() {
        if (this._running) {
            this.images.forEach((image) => image.stopAnimation());
            this._running = false;
        }
    }

    async add(image) {
        this._anchor.appendChild(image.element);
        if (image._map) {
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
        const fixedOffsetX = 50;
        const fixedOffsetY = 50;
        this._anchorHeight = height - fixedOffsetY * 2;
        this._anchorWidth = width - fixedOffsetX * 2;
        this._scale = Math.min(this.heightRatio, this.widthRatio);
        let
            offsetX = Math.floor(this._anchorWidth - this.scaledWidth) + fixedOffsetX * 2,
            offsetY = Math.floor(this._anchorHeight - this.scaledHeight) + fixedOffsetY * 2;

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
        this._anchor.removeChild(this._canvas);
        this._canvas = document.createElement('div');
        this._anchor.appendChild(this._canvas);
    }
}

export {
    MovingImage,
    Composition,
    LinearTrajectory,
};
