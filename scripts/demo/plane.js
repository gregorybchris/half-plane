export class Plane {
    constructor(svg, config) {
        this.svg = svg;
        this.config = config;
        this.addMouseListener();
        this.POINTS_CAP = 25;
        this.editable = false;
        this.createGraphicsLevels();
    }

    createGraphicsLevels() {
        let [w, h] = this.getDimensions();
        this.levelsSVG = this.svg.append("g")
        let edgeLevel = this.levelsSVG.append("g")
            .attr("id", "edges")
            .attr("width", w)
            .attr("height", h);
        let pointLevel = this.levelsSVG.append("g")
            .attr("id", "points")
            .attr("width", w)
            .attr("height", h);
        this.levels = { points: pointLevel, edges: edgeLevel };
    }

    reduceSize() {
        this.levelsSVG.transition()
            .duration(2000)
            .attr("transform", "translate(200, 320) scale(0.5)");
    }

    setEditable(editable) {
        this.editable = editable;
    }

    getSVG() {
        return this.svg;
    }

    clearAll() {
        this.levels.points.selectAll("circle").remove();
        this.levels.edges.selectAll("line").remove();
    }

    render() {
        // console.log("Plane render", this.svg);
        // console.log("Plane config", this.config);
    }

    addMouseListener() {
        let _this = this;
        this.svg.on("mousedown", function() {
            let [x, y] = d3.mouse(this);
			_this.drawPoint(x, y);
		});
    }

    getDimensions() {
        let width = parseFloat(this.svg.attr("width"))
        let height = parseFloat(this.svg.attr("height"))
        return [width, height];
    }

    drawPoint(x, y) {
        if (this.editable) {
            let points = this.config.getPoints();
            if (points.length < this.POINTS_CAP) {
                let newPoint = this.levels.points.append("circle")
                    .attr("class", "point")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 0)
                    .attr("name", points.length)
                    .style("fill", "#D5D5D5");
                points.push(newPoint);
                newPoint.transition()
                    .duration(300)
        			.attr("r", 7);
            }
            else {
                swal("Stop!", "You cannot add more than " + this.POINTS_CAP +
                    " points in this demo.");
            }
        }
        else {
            console.log("Plane editable is " + this.editable);
        }
    }

    drawEdge(x1, y1, x2, y2, color, width) {
        let newEdge = this.levels.edges.append("line")
            .attr("class", "edge")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", color)
            .attr("stroke-width", width)
            .attr("default-stroke", color);
        return newEdge;
    }

    static crand(min, max, bias, influence) {
        let rnd = Math.random() * (max - min) + min;
        let mix = Math.random() * influence;
        return rnd * (1 - mix) + bias * mix;
    }

    drawRandomPoint() {
        let [w, h] = this.getDimensions();
        let influence = 0.7;
        let xBias = w / 2, yBias = h / 2;
        let xMin = w * 0.08, xMax = w - xMin;
        let yMin = h * 0.08, yMax = h - yMin;
        let x = Plane.crand(xMin, xMax, xBias, influence);
        let y = Plane.crand(yMin, yMax, yBias, influence);
        this.drawPoint(x, y);
    }
}
