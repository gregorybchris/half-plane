import { turn } from "./geometry.js";

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
                .style("fill-opacity", 0)
                .style("stroke-opacity", 0);
            this.svg.append("line")
                .attr("id", "query-line")
                .attr("stroke", "#DDD")
                .attr("stroke-width", 2)
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x)
                .attr("y2", y);
        }
        else if (action == "up") {
            qs.mouseDown = false;
            this.svg.selectAll("#query-line").remove();
            let [startX, startY] = qs.start;
            let [endX, endY] = loc;
            this.resetQueryColors();
            if (startX != endX || startY != endY) {
                let angleRad = Math.atan2(endY - startY, endX - startX);
                let angleDeg = this.toDegrees(angleRad);
                let r = 1000;
                this.queryHalfPlane.attr("fill", "#46464b")
                    .attr("x", startX - r)
                    .attr("y", startY)
                    .style("stroke", "4B4B4F")
                    .style("stroke-width", 2)
                    .style("stroke-opacity", 0)
                    .style("fill-opacity", 0)
                    .attr("width", r * 2)
                    .attr("height", r * 2)
                    .attr("transform", "rotate(" + angleDeg + "," + startX + "," + startY + ")")
                    .transition()
                    .duration(400)
                    .style("stroke-opacity", 0.4)
                    .style("fill-opacity", 0.4);
                this.query(startX, startY, x, y);
            }
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
        this.resetQueryColors();
        this.colorQueryIntersection(x1, y1, x2, y2);

    }

    resetQueryColors() {
        let edgeLayers = this.config.getEdgeLayers();
        edgeLayers.forEach(function(edgeLayer) {
            edgeLayer.forEach(function(edge) {
                let edgeData = edge.datum();
                edge.attr("stroke", edgeData.color);
                [edgeData.start, edgeData.end].forEach(function(endPoint) {
                    endPoint.attr("stroke-opacity", 0);
                });
            });
        });
    }

    colorQueryIntersection(x1, y1, x2, y2) {
        let getX = pt => parseFloat(pt.attr("cx"));
        let getY = pt => parseFloat(pt.attr("cy"));
        let edgeLayers = this.config.getEdgeLayers();
        let queryPoint = this.queryPoint;
        edgeLayers.forEach(function(edgeLayer) {
            edgeLayer.forEach(function(edge) {
                let edgeData = edge.datum();
                let startPoint = edgeData.start;
                let endPoint = edgeData.end;
                let startX = getX(startPoint), startY = getY(startPoint);
                let endX = getX(endPoint), endY = getY(endPoint);
                startX = startX * 0.6 + 200;
                startY = startY * 0.6 + 320;
                endX = endX * 0.6 + 200;
                endY = endY * 0.6 + 320;
                if (queryPoint(x1, y1, x2, y2, startX, startY))
                    startPoint.attr("stroke-opacity", 0.5);
                // if (queryPoint(x1, y1, x2, y2, startX, startY) &&
                //         queryPoint(x1, y1, x2, y2, endX, endY))
                //     edge.attr("stroke", "#DDD");
            });
        });
    }

    queryPoint(qx1, qy1, qx2, qy2, px, py) {
        return turn(qx1, qy1, qx2, qy2, px, py) >= 0 ? true : false;
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
