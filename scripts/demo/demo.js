import { Plane } from "./plane.js";
import { Cascade } from "./cascade.js";
import { Config } from "./config.js";
import { makeConvexLayers } from "./geometry.js";

export class Demo {
    constructor() {
        this.WELCOME_STEP = 0;
        this.POPULATE_STEP = 1;
        this.HULL_STEP = 2;
        this.LIST_BUILD_STEP = 3;
        this.QUERY_STEP = 4;

        this.MIN_POINTS = 10;

        this.config = new Config();
        this.graphicsContainer = document.getElementById("graphics");
        this.svg = d3.select(this.graphicsContainer);
        this.createGraphicsPanels();
        this.colors = ["#c0392b", "#d95A06", "#f1c40f", "#27ae60", "#1abc9c", "#2980b9", "#8e44ad", "#e84393"];
    }

    createGraphicsPanels() {
        let [w, h] = this.getGraphicsDimensions();
        let planeSVG = this.svg.append("svg")
            .attr("id", "plane")
            .attr("width", w)
            .attr("height", h);
        this.plane = new Plane(planeSVG, this.config);
        let cascadeSVG = planeSVG.append("svg")
            .attr("id", "cascade")
            .attr("width", w)
            .attr("height", h);
        this.cascade = new Cascade(cascadeSVG, this.config);
        console.log("Demo Config", this.config);
    }

    run() {
        this.updateText();
        this.setFocus();
    }

    setFocus() {
        hotkeys("space,r,p", (event, handler) => this.onKeyPress(handler.key));
    }

    getGraphicsDimensions() {
        let graphicsWidth = this.graphicsContainer.clientWidth;
        let graphicsHeight = this.graphicsContainer.clientHeight;
        return [graphicsWidth, graphicsHeight];
    }

    onKeyPress(key) {
        if (key == "space")
            this.nextStep();
        else if (key == "r")
            this.restart();
        else if (key == "p")
            this.plane.drawRandomPoint();
    }

    nextStep() {
        let step = this.config.getStep();
        let points = this.config.getPoints();
        if (step == this.POPULATE_STEP && points.length < this.MIN_POINTS) {
            swal("Wait!", "You must add at least " + this.MIN_POINTS +
                " points to use this demo.");
        }
        else if (step < this.QUERY_STEP) {
            this.config.setStep(step + 1);
            step++;
            this.updateText();

            if (step == this.WELCOME_STEP)
                this.runWelcomeStep();
            else if (step == this.POPULATE_STEP)
                this.runPopulateStep();
            else if (step == this.HULL_STEP)
                this.runHullStep();
            else if (step == this.LIST_BUILD_STEP)
                this.runListBuildStep();
            else if (step == this.QUERY_STEP)
                this.runQueryStep();
        }
        else {
            this.restart();
        }
    }

    // ~ ~ ~ ~ ~ ~ ~ ~ ~
    // WELCOME_STEP
    // ~ ~ ~ ~ ~ ~ ~ ~ ~

    runWelcomeStep() {}

    // ~ ~ ~ ~ ~ ~ ~ ~ ~
    // POPULATE_STEP
    // ~ ~ ~ ~ ~ ~ ~ ~ ~

    runPopulateStep() {
        console.log("Run Populate Step");
        this.plane.setEditable(true);
    }

    // ~ ~ ~ ~ ~ ~ ~ ~ ~
    // HULL_STEP
    // ~ ~ ~ ~ ~ ~ ~ ~ ~

    runHullStep() {
        console.log("Run Hull Step");
        this.plane.setEditable(false);
        let points = this.config.getPoints();
        let convexLayers = makeConvexLayers(points);
        this.config.setConvexLayers(convexLayers);
        let edgeLayers = this.convexLayersToEdgeLayers(convexLayers);
        this.config.setEdgeLayers(edgeLayers);
    }

    convexLayersToEdgeLayers(convexLayers) {
        let edgeLayers = [];
        let strokeWidth = 5;
        convexLayers.forEach(function(convexLayer, layerNumber) {
            if (convexLayer.length != 1) {
                let color = this.colors[layerNumber % this.colors.length];
                let edgeLayer = [];
                for (var i = 0; i < convexLayer.length - 1; i++) {
                    let pt1 = convexLayer[i], pt2 = convexLayer[i + 1];
                    let newEdge = this.createEdge(pt1, pt2, color, strokeWidth);
                    edgeLayer.push(newEdge);
                }
                if (convexLayer.length != 2) {
                    let pt1 = convexLayer[convexLayer.length - 1], pt2 = convexLayer[0];
                    let lastEdge = this.createEdge(pt1, pt2, color, strokeWidth);
                    edgeLayer.push(lastEdge);
                }
                let sortedEdgeLayer = this.sortByAngle(edgeLayer);
                edgeLayers.push(sortedEdgeLayer);
            }
        }.bind(this));
        return edgeLayers;
    }

    createEdge(pt1, pt2, color, strokeWidth) {
        let getX = pt => parseFloat(pt.attr("cx"));
        let getY = pt => parseFloat(pt.attr("cy"));
        let x1 = getX(pt1), x2 = getX(pt2), y1 = getY(pt1), y2 = getY(pt2);
        let edge = this.plane.drawEdge(x1, y1, x1, y1, color, strokeWidth);
        let pointSize = parseInt(pt1.attr("r"));
        let edgeData = {
            start: pt1,
            end: pt2,
            color: color,
            pointSize: pointSize,
            boxes: []
        };
        edge.datum(edgeData);
        edge.transition()
            .duration(1200)
            .attr("x2", x2)
            .attr("y2", y2);
        return edge;
    }

    // ~ ~ ~ ~ ~ ~ ~ ~ ~
    // LIST_BUILD_STEP
    // ~ ~ ~ ~ ~ ~ ~ ~ ~

    runListBuildStep() {
        console.log("Run List Build Step");

        this.plane.reduceSize();
        this.cascade.drawTables();
    }

    // ~ ~ ~ ~ ~ ~ ~ ~ ~
    // QUERY_STEP
    // ~ ~ ~ ~ ~ ~ ~ ~ ~

    runQueryStep() {
        console.log("Run Query Step");
        this.cascadeEdgeLayers();
        this.plane.allowQueries()
    }

    cascadeEdgeLayers() {
        let edgeLayers = this.config.getEdgeLayers();
        let newEdgeLayers = edgeLayers.map(edgeLayer => edgeLayer.slice());
        for (var i = newEdgeLayers.length - 1; i > 0 ; i--) {
            let edgeLayer = newEdgeLayers[i];
            let nextEdgeLayer = newEdgeLayers[i - 1];
            let evenEdges = edgeLayer.filter((e, idx) => idx % 2 === 0);
            let mergedLayer = this.mergeByAngle(nextEdgeLayer, evenEdges);
            newEdgeLayers[i - 1] = mergedLayer;
        }
        this.config.setEdgeLayers(newEdgeLayers);
        this.cascade.drawTables();
    }

    mergeByAngle(layer1, layer2) {
        let i = 0, j = 0;
        let result = [];
        while (i < layer1.length && j < layer2.length) {
            if (this.getEdgeAngle(layer1[i]) < this.getEdgeAngle(layer2[j]))
                result.push(layer1[i++]);
            else
                result.push(layer2[j++]);
        }
        while (i < layer1.length)
            result.push(layer1[i++]);
        while (j < layer2.length)
            result.push(layer2[j++]);
        return result;
    }

    sortByAngle(edgeList) {
        return edgeList.sort(function(a, b) {
            return this.getEdgeAngle(a) - this.getEdgeAngle(b);
        }.bind(this));
    }

    getEdgeAngle(edge) {
        let getX = pt => parseFloat(pt.attr("cx"));
        let getY = pt => parseFloat(pt.attr("cy"));
        let pointData = edge.datum();
        let pt1 = pointData.start, pt2 = pointData.end;
        let x1 = getX(pt1), x2 = getX(pt2), y1 = getY(pt1), y2 = getY(pt2);
        return Math.atan2(y1 - y2, x2 - x1) + Math.PI / 2;
    }

    restart() {
        swal({
                title: "Really?",
                text: "This will restart the demo",
                showCancelButton: true,
                confirmButtonText: "Yes, restart",
            },
            function() {
                this.config.reset();
                this.svg.selectAll("*").remove();
                this.createGraphicsPanels();
                this.updateText();
            }.bind(this)
        );
    }

    updateText() {
        $(".explanation-section")
            .fadeOut(100)
            .promise()
            .done(() => $(".explanation-section[data-step='" +
                this.config.getStep() + "']").fadeIn(500));
    }
}
