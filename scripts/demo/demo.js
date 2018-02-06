export class Demo {
    constructor() {
        this.WELCOME_STEP = 0;
        this.CREATION_STEP = 1;
        this.HULL_STEP = 2;
        this.LIST_BUILD_STEP = 3;
        this.LIST_PROP_STEP = 4;
        this.QUERY_STEP = 5;

        this.step = 0;
        this.graphics = d3.select("#graphics");
    }

    run() {
        this.setFocus();
        this.updateText();
    }

    setFocus() {
        hotkeys("space,r", (event, handler) => this.onKeyPress(handler.key));
    }

    onKeyPress(key) {
        if (key == "space")
            this.nextStep();
        else if (key == "r")
            this.restart();
    }

    nextStep() {
        this.step++;
        this.updateText();
        if (this.step == WELCOME_STEP)
            runWelcomeStep();
        else if (this.step == CREATION_STEP)
            runCreationStep();
        else if (this.step == HULL_STEP)
            runHullStep();
        else if (this.step == LIST_BUILD_STEP)
            runListBuildStep();
        else if (this.step == LIST_PROP_STEP)
            runListPropStep();
        else if (this.step == QUERY_STEP)
            runQueryStep();
    }

    runWelcomeStep() {}

    runCreationStep() {
        
    }

    runHullStep() {

    }

    runListBuildStep() {

    }

    runListPropStep() {

    }

    runQueryStep() {

    }

    restart() {
        this.step = 0;
        this.updateText();
    }

    updateText() {
        $(".explanation-section")
            .fadeOut(100)
            .promise()
            .done(() => $(".explanation-section[data-step='" +
                this.step + "']").fadeIn(500));
    }
}
