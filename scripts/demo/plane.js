class Plane {
    constructor(container) {
        this.graphics = container;
        this.addMouseListener();
    }

    addMouseListener() {

    }

    static crand(min, max, bias, influence) {
        let rnd = Math.random() * (max - min) + min;
        let mix = Math.random() * influence;
        return rnd * (1 - mix) + bias * mix;
    }

    drawRandomPoint() {
        var width = graphics.getWidth();
        var height = graphics.getHeight();
        var influence = 0.7;
        var xBias = width / 2, yBias = height / 2;
        var xMin = width * 0.05, xMax = width - xMin;
        var yMin = height * 0.05, yMax = height - yMin;
        var x = Plane.crand(xMin, xMax, xBias, influence);
        var y = Plane.crand(yMin, yMax, yBias, influence);
        return graphics.putPoint(x, y);
    }
}
