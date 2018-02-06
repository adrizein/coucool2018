'use strict';

import * as _ from 'lodash';


class BaseTrajectory {

    constructor(func, length) {
        this._func = func;
        this.length = _.max([0, _.min([length, 1])]);
    }

    position(t) {
        if (t < 0) {
            return this._func(0);
        }
        else if (t <= this.length) {
            return this._func(t / this.length);
        }
        else {
            return this._func(1);
        }
    }
}


class Trajectory {

    constructor() {
        this._trajectories = [];
    }

    static Line(vx, vy) {

        const
            trajectory = new Trajectory();

        trajectory.append((t) => ({x: vx * t, y: vy * t}));

        return trajectory;
    }

    static compose(...trajectories) {

        return trajectories.reduce((t1, t2) => t1.append(t2), new Trajectory());
    }

    append(trajectory, length = 1) {
        if (trajectory instanceof BaseTrajectory) {
            if (this.length) {
                const newLength = trajectory.length + this.length;
                trajectory.length /= newLength;
                this._trajectories.forEach((traj) => {
                    traj.length /= newLength;
                });

                this._trajectories.push(trajectory);
            }
            else {
                this._trajectories.push(trajectory);
            }
        }
        else if (trajectory instanceof Trajectory) {
            trajectory._trajectories.forEach((traj) => {
                this.append(traj);
            });
        }
        else if (_.isFunction(trajectory)) {
            return this.append(new BaseTrajectory(trajectory, length));
        }
        else {
            throw new TypeError('trajectory must either be a function or a Trajectory');
        }
    }

    get length() {
        return _.sum(this._trajectories.map(({duration}) => duration)) || 0;
    }

    get points() {
        return this._trajectories
            .map((trajectory) => trajectory.length)
            .reduce((lengths, length) => [...lengths, length + (lengths[lengths.length - 1] || 0)], []);
    }

    position(t) {
        if (!this._trajectories.length) {
            return {x: null, y: null};
        }

        let n = 0;
        for (const point of this.points) {
            if (t <= point) {
                break;
            }
            else {
                ++n;
            }
        }

        return this._trajectories[n].position(t);
    }
}

class MovingImage {

    constructor({id, src}, trajectory) {
        this.element = new Image();
        this.element.src = src;
        this.element.id = id;

        this._trajectory = trajectory;
        this.element.onload = () => {
            this._height = this.height;
            this._width = this.width;
            this._top = this.element.offsetTop;
            this._left = this.element.offsetLeft;
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

    move(t) {
        const {x, y} = this._trajectory.position(t);

        this.element.style.top = `${y}px`;
        this.element.style.left = `${x}px`;
    }

    resize(scale) {
        this.element.height = scale * this._height;
        this.element.width = scale * this._width;
        this.element.style.top = `${scale * this._top}px`;
        this.element.style.left = `${scale * this._left}px`;
    }
}

class Composition {

    constructor(anchor, height_, width_) {
        this._images = [];
        this._anchor = anchor;
        this._height = height_;
        this._width = width_;
    }

    animate(t) {
        window.requestAnimationFrame(() => {
            this._images.forEach((image) => {
                image.move(t);
            });
        });
    }

    add(image) {
        this._anchor.appendChild(image.element);
        this._images.push(image);
        image.element.addEventListener('load', () => image.resize(this.scale));
    }

    get scale() {
        const {height, width} = this._anchor.getBoundingClientRect();

        return _.min([height / this._height, width / this._width]);
    }

    rescale() {
        const scale = this.scale;
        this._images.forEach((image) => image.resize(scale));
    }
}

export {
    MovingImage,
    Composition,
    Trajectory,
};
