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

    constructor({id, src, zIndex, trajectory, shape, title, onClick}) {
        this.element = new Image();
        this.element.src = src;
        this.element.id = id;
        this.element.style.zIndex = zIndex;
        this.zIndex = zIndex;
        this._trajectory = trajectory;
        if (shape) {
            this.title = title;
            this.onClick = onClick;
            this.createMap(shape);
            this.createOverlay();
            this.element.useMap = "#" + this._map.name;
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
        area.addEventListener("mouseover", (event) => {
            this.mouseOver();
        });
        area.addEventListener("mouseout", (event) => {
            this.mouseOut();
        });
        area.addEventListener("click", (event) => {
            this.onClick();
        });
        this.area = area;
        this._map.appendChild(area);

    }

    createOverlay() {
        this.overlay = document.createElement("div");
        this.overlay.innerHTML = this.title;
        this.overlay.style.textAlign = "center";
        this.overlay.style.position = "absolute";
        this.overlay.style.pointerEvents = "none";
        this.overlay.style.zIndex = 1;
        this.overlay.style.opacity = 0;
    }


    resize(scale, t, offsetX, offsetY) {
        this.element.height = scale * this.height;
        this.element.width = scale * this.width;
        this._trajectory.offsetX = offsetX;
        this._trajectory.offsetY = offsetY;
        this.move(scale, t);
        if (this.area) {
            if (this.area.shape === "circle"){
                const radius = this.element.width / 2;
                this.area.coords = radius + ","+ radius + "," + radius; //TODO
            }

            if (this.area.shape === "rect"){
                this.area.coords = "0,0," + this.element.width + "," + this.element.height; //TODO
            }
            if (this.area.shape === "poly"){
                //For the moment we only have one triangle, the wood one
                var point1 = "0,0";
                var point2 = "0," + this.element.width;
                var point3 = this.element.height + "," + this.element.width;
                this.area.coords = point1 + "," + point2 + "," + point3; //TODO
            }
        }
        if (this.overlay) {
            this.overlay.style.height = `${this.element.height}px`;
            this.overlay.style.lineHeight = `${this.element.height}px`;
            this.overlay.style.width =  `${this.element.width}px`;
            this.overlay.style.top = this.element.style.top;
            this.overlay.style.left = this.element.style.left;
        }
    }

    move(scale, t) {
        const {x, y} = this._trajectory.position(scale, t);
        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;

        /*
        this.element.height = (1 +2*t) * scale * this.height;
        this.element.width = (1+2*t) * scale * this.width;
        */
    }

    async runAnimation(scale, t, duration, progress) {
        const {x, y} = this._trajectory.position(scale, t);

        return Velocity(this.element, {top: y, left: x}, {
            queue: false,
            duration,
            easing: 'easeInOutSine',
            progress(elements, completion, remaining) {
                if (progress) {
                    progress(completion, remaining);
                }
            },
        });
    }

    stopAnimation() {
        Velocity(this.element, 'stop');
    }

    mouseOver(){
        this.element.style.zIndex = 14;
        this.overlay.style.zIndex = 20;
        this.overlay.style.opacity = 1;
    }

    mouseOut(){
        this.element.style.zIndex = this.zIndex;
        this.overlay.style.zIndex = 1;
        this.overlay.style.opacity = 0;
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
        this.running = false;
    }

    animate(t) {
        this._t = t;
        this.images.forEach((image) => image.move(this._scale, this._t));
    }

    async runAnimation(duration, t) {
        if (!this.running) {
            this.running = true;
            this._lastRun = {duration, t};
            const oldT = this._t;
            await Promise.all(this.images.map((image) => image.runAnimation(
                this._scale,
                t,
                duration,
                (completion, remaining) => {
                    this._t = (t - oldT) * completion + oldT;
                    this._lastRun.duration = remaining;
                }
            )));

            this.running = false;
            return true;
        }
        else {
            return false;
        }
    }

    pauseAnimation() {
        if (this.running) {
            this.images.forEach((image) => image.stopAnimation());
        }
    }

    async resumeAnimation() {
        if (this.running) {
            return this.runAnimation(this._lastRun.duration, this._lastRun.t);
        }
    }

    stopAnimation() {
        if (this.running) {
            this.images.forEach((image) => image.stopAnimation());
            this.running = false;
            this._lastRun = null;
        }
    }

    async add(image) {
        this._anchor.appendChild(image.element);
        if (image._map) {
            this._anchor.appendChild(image._map);
        }
        if (image.overlay) {
            this._anchor.appendChild(image.overlay);
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
