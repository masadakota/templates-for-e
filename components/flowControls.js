class FlowControls {
    constructor() {
        this.isFlowActive = false;
    }

    startFlow() {
        if (!this.isFlowActive) {
            this.isFlowActive = true;
            console.log("Flow started.");
            // Additional logic to start the flow can be added here
        } else {
            console.log("Flow is already active.");
        }
    }

    stopFlow() {
        if (this.isFlowActive) {
            this.isFlowActive = false;
            console.log("Flow stopped.");
            // Additional logic to stop the flow can be added here
        } else {
            console.log("Flow is not active.");
        }
    }

    resetFlow() {
        this.isFlowActive = false;
        console.log("Flow reset.");
        // Additional logic to reset the flow can be added here
    }
}

export default FlowControls;