'use strict';

import * as _ from 'lodash';


class BaseTrajectory {

    constructor(func, length) {
        this._func = func;
        this.length = _.max([0, _.min([length, 1])]);
    }

    position(t) {
        if (t < 0) {
            return this.position(0);
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

    *points() {
        let pos = 0;
        for (const trajectory of this._trajectories) {
            pos += trajectory.length;
            yield pos;
        }
    }

    position(t) {
        let n = 0;
        for (const point of this.points()) {
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
        this._image = new Image();
        this._image.src = src;
        this._image.id = id;
        this._image.

        this._trajectory = trajectory;
    }

    get height() {
        return this._image.height;
    }

    get width() {
        return this._image.width;
    }

    get id() {
        return this._image.id;
    }

    get image() {
        return this._image.src;
    }

    set image(src) {
        this._image.src = _.get(src, 'src') || src;
    }

    move(t) {
        const {x, y} = this._trajectory.position(t);

        this._image.style.top = y;
        this._image.style.left = x;
    }

    resize(scale) {
        this._image.style.top *= scale;
        this._image.style.left *= scale;
        this._image.height *= scale;
        this._image.width *= scale;
    }

    insertOn(element) {
        element.appendChild(this._image);
    }

}

class Composition {

    constructor(anchor, scale = 1) {
    }

    animate(t) {
        window.requestAnimationFrame(() => {
            this.images.forEach((image) => {
                image.move(t);
            });
        });
    }

    add()
}

export {
    MovingImage,
    Composition,
    Trajectory,
};
