export class Plane {
    constructor(svg, config) {
        this.svg = svg;
        this.config = config;
        this.addMouseListener();
        this.POINTS_CAP = 25;
        this.editable = false;
        this.queryable = false;
        this.createGraphicsLevels();
    }

    createGraphicsLevels() {
        let [w, h] = this.getDimensions();
        this.queryHalfPlane = this.svg.append("rect")
            .attr("id", "query-half-plane")
        this.levelsSVG = this.svg.append("g")
            .attr("id", "levels")
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
            .attr("transform", "translate(200, 320) scale(0.6)");
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

    addMouseListener() {
        let _this = this;
        this.svg.on("mousedown", function() {
            let [x, y] = d3.mouse(this);
            if (_this.editable)
                _this.drawPoint(x, y);
            if (_this.queryable)
                _this.handleQueryEvent("down", [x, y]);
		});
        this.svg.on("mouseup", function() {
            let [x, y] = d3.mouse(this);
            if (_this.queryable)
                _this.handleQueryEvent("up", [x, y]);
        });
        this.svg.on("mousemove", function() {
            let [x, y] = d3.mouse(this);
            if (_this.queryable)
                _this.handleQueryEvent("move", [x, y]);
        });
    }

    getDimensions() {
        let width = parseFloat(this.svg.attr("width"))
        let height = parseFloat(this.svg.attr("height"))
        return [width, height];
    }

    handleQueryEvent(action, loc) {
        let [x, y] = loc;
        let qs = this.queryState;

        if (action == "down") {
            qs.mouseDown = true;
            qs.start = loc;
            this.queryHalfPlane.transition()
                .duration(400)
                .style("fill-opacity", 0);
            this.svg.append("line")
                .attr("id", "query-line")
                .attr("stroke", "#FFF")
                .attr("stroke-width", 2)
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x)
                .attr("y2", y)
        }
        else if (action == "up") {
            qs.mouseDown = false;
            this.svg.selectAll("#query-line").remove();
            let [startX, startY] = qs.start;
            let [endX, endY] = loc;
            let angleRad = Math.atan2(endY - startY, endX - startX);
            let angleDeg = this.toDegrees(angleRad);
            let r = 1000;
            console.log("Angle of Query (Rad)", angleRad);
            console.log("Angle of Query (Deg)", angleDeg);
            this.queryHalfPlane.attr("fill", "#46464b")
                .attr("x", startX - r)
                .attr("y", startY)
                .attr("width", r * 2)
                .attr("height", r * 2)
                .attr("transform", "rotate(" + angleDeg + "," + startX + "," + startY + ")")
                .style("fill-opacity", 0)
                .transition()
                .duration(400)
                .style("fill-opacity", 0.4);
            this.query(startX, startY, x, y);
        }
        else if (action == "move") {
            if (qs.mouseDown) {
                d3.select("#query-line")
                    .attr("x2", x)
                    .attr("y2", y)
            }
        }
    }

    toDegrees(rads) {
        return rads / Math.PI * 180;
    }

    query(x1, y1, x2, y2) {
        console.log("Query: ", "(" + x1 + ", " + y1 + ") -> (" + x2 + ", " + y2 + ")");
    }

    allowQueries() {
        this.queryable = true;
        this.queryState = {
            mouseDown: false,
            start: [0, 0]
        };
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
                    .attr("stroke", "#AAA")
                    .attr("stroke-width", "8")
                    .attr("stroke-opacity", "0")
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
            // console.log("Plane editable is " + this.editable);
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
