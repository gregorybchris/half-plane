export class Cascade {
    constructor(svg, config) {
        this.svg = svg;
        this.config = config;
        this.addMouseListener();
    }

    getSVG() {
        return this.svg;
    }

    render() {
        console.log("Cascade render", this.svg);
        console.log("Cascade Config", this.config);
    }

    addMouseListener() {

    }
}
