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
        // width = width / 2;
        height = height / 2;
        let margin = { horiz: width * 0.1, vert: height * 0.2 };
        let maxLayerSize = Math.max(...(edgeLayers.map(a => a.length)));
        let xBandwidth = (width - margin.horiz * 2) / maxLayerSize;
        let yBandwidth = (height - margin.vert * 2) / edgeLayers.length;
        let bandwidth = Math.min(xBandwidth, yBandwidth);
        let boxPadding = 2;

        d3.select("#cascade-lists").remove();
        let cascadeListsSVG = this.svg.append("g").attr("id", "cascade-lists");
        let boxes = cascadeListsSVG.selectAll("g")
            .data(edgeLayers)
            .enter()
            .append("g").attr("class", "cascade-list")
            .selectAll("g")
            .data(d => d)
            .enter()
            .append("g").attr("class", "cascade-box")
            // Note: D3 v3 is required here. D3 v4 will not set the j variable in this scope
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

        let boxBackgrounds = boxes.append("rect").attr("class", "cascade-box-background")
            .attr("x", boxPadding)
            .attr("y", boxPadding)
            .attr("fill", "#424249")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", bandwidth - boxPadding * 2)
            .attr("height", bandwidth - boxPadding * 2)

        let getX = pt => parseFloat(pt.attr("cx"));
        let getY = pt => parseFloat(pt.attr("cy"));
        let boxIndicators = boxes.append("line")
            .each(function(line) {
                let stroke = line.attr("default-stroke");
                let c = bandwidth / 2;
                let r = c * 0.6;
                let pointData = line.datum();
                let pt1 = pointData.start, pt2 = pointData.end;
                let x1 = getX(pt1), x2 = getX(pt2), y1 = getY(pt1), y2 = getY(pt2);

                let lx1, ly1, lx2, ly2;
                if (x1 == x2) {
                    lx1 = c, ly1 = c - r;
                    lx2 = c, ly2 = c + r;
                }
                else {
                    let m = (y2 - y1) / (x2 - x1);
                    lx1 = c - r / Math.sqrt(1 + m * m), ly1 = c - r * m / Math.sqrt(1 + m * m);
                    lx2 = c + r / Math.sqrt(1 + m * m), ly2 = c + r * m / Math.sqrt(1 + m * m);
                }

                d3.select(this).attr({
                    class: "cascade-box-indicator",
                    stroke: stroke,
                    "stroke-width": 3,
                    x1: lx1,
                    y1: ly1,
                    x2: lx2,
                    y2: ly2,
                    "stroke-linecap": "round"
                });
            });

        let toggleLightEdge = this.toggleLightEdge;
        let toggleLightEdgeBackgrounds = this.toggleLightEdgeBackgrounds;
        boxes.each(function(edge) {
            let box = d3.select(this);
            let edgeData = edge.datum();
            edgeData.boxes.push(box);
            box.on("mouseover", function() {
                toggleLightEdge(edge, true);
                toggleLightEdgeBackgrounds(edge, true);
            });
            box.on("mouseout", function() {
                toggleLightEdge(edge, false);
                toggleLightEdgeBackgrounds(edge, false);
            });
            edge.on("mouseover", function() {
                toggleLightEdge(edge, true);
                toggleLightEdgeBackgrounds(edge, true);
            });
            edge.on("mouseout", function() {
                toggleLightEdge(edge, false);
                toggleLightEdgeBackgrounds(edge, false);
            });
        });
    }

    toggleLightEdge(edge, lit) {
        let edgeData = edge.datum();
        let color, endPointOpacity;
        if (lit) {
            color = "#AAA";
            endPointOpacity = 0.5;
        }
        else {
            color = edgeData.color;
            endPointOpacity = 0;
        }
        edge.attr("stroke", color);
        [edgeData.start, edgeData.end].forEach(function(endPoint) {
            endPoint.transition().duration(0)
                .attr("stroke-opacity", endPointOpacity);
        });
    }

    toggleLightEdgeBackgrounds(edge, lit) {
        let edgeData = edge.datum();
        let color;
        if (lit) {
            color = "#5e5e68";
        }
        else {
            color = "#424249";
        }
        edgeData.boxes.forEach(function(edgeBox) {
            edgeBox.select(".cascade-box-background")
                .attr("fill", color);
        });
    }

    getSVG() {
        return this.svg;
    }
}
