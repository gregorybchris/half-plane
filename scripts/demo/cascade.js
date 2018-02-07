export class Cascade {
    constructor(svg, config) {
        this.svg = svg;
        this.config = config;
        this.createGraphicsLevels();
    }

    createGraphicsLevels() {
        let [w, h] = this.getDimensions();
        let boxLevel = this.svg.append("g")
            .attr("id", "boxes")
            .attr("width", w)
            .attr("height", h);
        this.levels = { boxes: boxLevel };
    }

    getDimensions() {
        let width = parseFloat(this.svg.attr("width"))
        let height = parseFloat(this.svg.attr("height"))
        return [width, height];
    }

    drawTables() {

    }

    getSVG() {
        return this.svg;
    }

    render() {
        console.log("Cascade render", this.svg);
        console.log("Cascade Config", this.config);
    }
}
