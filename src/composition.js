
class Trajectory {

    constructor(func, start, end) {
        this.func = func;
        this._start = start;
        this._end = end;
    }

    paint() {

    }

    static buildLine(start, end) {

    }

    static compose(...trajectories) {

    }
}

class Element {
    constructor(htmlElement, trajectory) {
        this._element = htmlElement;
        this._trajectory = trajectory;
    }
}

class Composition {
    constructor(anchor, images) {
        this.anchor = anchor;
        this.images = images;
    }

    paint(t, width, height) {
        this.images.forEach((images) => images.trajectory(t));
    }
}
