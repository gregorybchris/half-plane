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
        this.createGraphicsPanels();
        this.colors = ["#c0392b", "#d95A06", "#f1c40f", "#27ae60", "#1abc9c", "#2980b9", "#8e44ad", "#e84393"];
    }

    createGraphicsPanels() {
        let [w, h] = this.getGraphicsDimensions();
        let planeSVG = d3.select(this.graphicsContainer).append("svg")
            .attr("id", "plane")
            .attr("width", w)
            .attr("height", h);
        this.plane = new Plane(planeSVG, this.config);
        let cascadeSVG = d3.select(this.graphicsContainer).append("svg")
            .attr("id", "cascade");
        this.cascade = new Cascade(cascadeSVG, this.config);
        this.render();
        console.log("Demo Config", this.config);
    }

    run() {
        this.updateText();
        this.setFocus();
    }

    setFocus() {
        hotkeys("space,r,p", (event, handler) => this.onKeyPress(handler.key));
        window.addEventListener("resize", this.render.bind(this));
    }

    getGraphicsDimensions() {
        let graphicsWidth = this.graphicsContainer.clientWidth;
        let graphicsHeight = this.graphicsContainer.clientHeight;
        return [graphicsWidth, graphicsHeight];
    }

    render() {
        console.log("Demo Render");
        let [width, height] = this.getGraphicsDimensions();
        let planeSVG = this.plane.getSVG();
        planeSVG.attr("width", width)
            .attr("height", height)
            .style("background-color", "transparent");
        this.plane.render();
        this.cascade.render();
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

    runWelcomeStep() {}

    runPopulateStep() {
        console.log("Run Populate Step");
        this.plane.setEditable(true);
    }

    runHullStep() {
        console.log("Run Hull Step");
        this.plane.setEditable(false);
        let points = this.config.getPoints();
        let convexLayers = makeConvexLayers(points);
        console.log("Convex Layers", convexLayers);
        this.config.setConvexLayers(convexLayers);
        let edgeLayers = this.convexLayersToEdgeLayers(convexLayers);
        this.config.setEdgeLayers(edgeLayers);
        console.log("Edge Layers", edgeLayers);
    }

    convexLayersToEdgeLayers(convexLayers) {
        var getX = pt => parseFloat(pt.attr("cx"));
        var getY = pt => parseFloat(pt.attr("cy"));
        let edgeLayers = [];
        convexLayers.forEach(function(convexLayer, layerNumber) {
            let color = this.colors[layerNumber % this.colors.length];
            let edgeLayer = [];
            for (var i = 0; i < convexLayer.length - 1; i++) {
                let pt1 = convexLayer[i], pt2 = convexLayer[i + 1];
                let x1 = getX(pt1), x2 = getX(pt2), y1 = getY(pt1), y2 = getY(pt2);
                let newEdge = this.plane.drawEdge(x1, y1, x1, y1, color, 5);
                newEdge.transition()
                    .duration(1200)
                    .attr("x2", x2)
                    .attr("y2", y2);
                edgeLayer.push(newEdge);
            }
            let pt1 = convexLayer[convexLayer.length - 1], pt2 = convexLayer[0];
            let x1 = getX(pt1), x2 = getX(pt2), y1 = getY(pt1), y2 = getY(pt2);
            let lastEdge = this.plane.drawEdge(x1, y1, x1, y1, color, 5);
            lastEdge.transition()
                .duration(1200)
                .attr("x2", x2)
                .attr("y2", y2);
            edgeLayer.push(lastEdge);
            edgeLayer.forEach(function(edge) {
                this.addListenersToEdge(edge);
            }.bind(this));
            edgeLayers.push(edgeLayer);
        }.bind(this));
        return edgeLayers;
    }

    addListenersToEdge(edge) {
        edge.on("mouseover", function() {
            edge.attr("stroke", "#FFF");
        });
        edge.on("mouseout", function() {
            edge.attr("stroke", edge.attr("default-stroke"));
        });
    }

    runListBuildStep() {
        console.log("Run List Build Step");

        let planeSVG = this.plane.getSVG();
        planeSVG.transition()
            .duration(2000)
            .attr("transform", "translate(0, 200) scale(0.5)");

        this.cascade.drawTables();
    }

    runQueryStep() {
        console.log("Run Query Step");
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
                this.plane.clearAll();
                this.updateText();
                this.render();
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
