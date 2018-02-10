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
        let xBandwidth = (width - margin.horiz * 2) / maxLayerSize;
        let yBandwidth = (height - margin.vert * 2) / edgeLayers.length;
        let bandwidth = Math.min(xBandwidth, yBandwidth);
        let boxPadding = 2;

        let cascadeListsSVG = this.svg.append("g").attr("id", "cascadeLists");
        let boxes = cascadeListsSVG.selectAll("g")
            .data(edgeLayers)
            .enter()
            .append("g").attr("class", "cascadeList")
            .selectAll("g")
            .data(d => d)
            .enter()
            .append("g").attr("class", "cascadeBox")
            .attr("transform", function(d, i, j) {
                let xTrans = margin.horiz + i * bandwidth + boxPadding;
                let yTrans = margin.vert + j * bandwidth + boxPadding;
                return "translate(" + xTrans + ", " + yTrans + ")";
            })
            .data(d => d)
            .style("opacity", 0)

        boxes.transition()
            .duration(1500)
            .style("opacity", 1);

        let boxBackgrounds = boxes.append("rect").attr("class", "cascadeBoxBackground")
            .attr("x", boxPadding)
            .attr("y", boxPadding)
            .attr("fill", "#5e5e68")
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill-opacity", 0.4)
            .attr("width", bandwidth - boxPadding * 2)
            .attr("height", bandwidth - boxPadding * 2)

        let getX = pt => parseFloat(pt.attr("cx"));
        let getY = pt => parseFloat(pt.attr("cy"));
        let boxIndicators = boxes.append("line")
            .each(function(d) {
                let stroke = d.attr("default-stroke");
                let c = bandwidth / 2;
                let r = c * 0.6;
                let pointData = d.datum();
                let pt1 = pointData.start, pt2 = pointData.end;
                let x1 = getX(pt1), x2 = getX(pt2), y1 = getY(pt1), y2 = getY(pt2);
                //TODO: Be more careful calculating slope! It could be undefined :(
                let m = (y2 - y1) / (x2 - x1);
                let lx1 = c - r / Math.sqrt(1 + m * m), ly1 = c - r * m / Math.sqrt(1 + m * m);
                let lx2 = c + r / Math.sqrt(1 + m * m), ly2 = c + r * m / Math.sqrt(1 + m * m);
                d3.select(this).attr({
                    class: "cascadeBoxIndicator",
                    stroke: stroke,
                    "stroke-width": 3,
                    x1: lx1,
                    y1: ly1,
                    x2: lx2,
                    y2: ly2,
                    "stroke-linecap": "round"
                });
            });

        boxes.each(function(edge) {
            let box = d3.select(this);
            let background = box.select(".cascadeBoxBackground");
            let edgeData = edge.datum();
            box.on("mouseover", function() {
                background.attr("fill", "#9797a8");
                edge.attr("stroke", "#FFF");
            });
            box.on("mouseout", function() {
                background.attr("fill", "#5e5e68");
                edge.attr("stroke", edgeData.color);
            });
        })
    }

    getSVG() {
        return this.svg;
    }

    render() {
        // console.log("Cascade render", this.svg);
    }
}
