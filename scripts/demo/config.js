export class Config {
    constructor() {
        this.reset();
    }

    reset() {
        this.points = [];
        this.convexLayers = [];
        this.edgeLayers = [];
        this.step = 0;
    }

    getStep() {
        return this.step;
    }

    setStep(step) {
        this.step = step;
    }

    getPoints() {
        return this.points;
    }

    setPoints(points) {
        this.points = points;
    }

    getConvexLayers() {
        return this.convexLayers;
    }

    setConvexLayers(convexLayers) {
        this.convexLayers = convexLayers;
    }

    getEdgeLayers() {
        return this.edgeLayers;
    }

    setEdgeLayers(edgeLayers) {
        this.edgeLayers = edgeLayers;
    }
}
