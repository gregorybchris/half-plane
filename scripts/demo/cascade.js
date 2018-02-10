export class Cascade {
    constructor(svg, config) {
        this.svg = svg;
        this.config = config;
        console.log("Cascade SVG:", this.svg)
    }

    getDimensions() {
        let width = parseFloat(this.svg.attr("width"))
        let height = parseFloat(this.svg.attr("height"))
        return [width, height];
    }

    // https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    static blendColors(c0, c1, p) {
        var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
        return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
    }

    drawTables() {
        let edgeLayers = this.config.getEdgeLayers();
        let [width, height] = this.getDimensions();
        width = width / 2;
        height = height / 2;
        let margin = { horiz: width * 0.1, vert: height * 0.2 };

        let maxLayerSize = Math.max(...(edgeLayers.map(a => a.length)));
        console.log("max layer size", maxLayerSize);
        let xBandwidth = (width - margin.horiz * 2) / maxLayerSize;
        let yBandwidth = (height - margin.vert * 2) / edgeLayers.length;
        console.log("xband", xBandwidth)
        console.log("yband", yBandwidth)
        let bandwidth = Math.min(xBandwidth, yBandwidth);
        console.log("bandwidth", bandwidth)

        let cascadeListsSVG = this.svg.append("g").attr("id", "cascadeLists")

        let boxPadding = 2;

        cascadeListsSVG.selectAll("g")
            .data(edgeLayers)
            .enter()
            .append("g").attr("id", "cascadeList")
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", (d, i, j) => margin.horiz + i * bandwidth + boxPadding)
            .attr("y", (d, i, j) => margin.vert + j * bandwidth + boxPadding)
            .attr("width", bandwidth - boxPadding * 2)
            .attr("height", bandwidth - boxPadding * 2)
            .attr("fill", "#FFF")
            .style("opacity", 0)
            .style("fill-opacity", 0.4)
            .transition()
            .duration(1500)
            .style("opacity", 1);
    }

    createBox() {

    }

    getSVG() {
        return this.svg;
    }

    render() {
        console.log("Cascade render", this.svg);
    }
}
