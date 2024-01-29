// simulatedTiming.js

function toggleSequencerSimulator() {
            console.log("[toggleSequencerSimulator] Function called.");

            if (!isSimulatorRunning) {
                console.log("[toggleSequencerSimulator] Simulator is not running.");

                // Start the simulator
                if (isSimulatedMode) {
                    console.log("[toggleSequencerSimulator] Switching to Simulated Mode.");

                    const bpm = 105;
                    const beatsPerSecond = bpm / 60; 
                    const stepInterval = 1 / (beatsPerSecond * 4); 

                    if (simulatedSequencerTimeout) {
                        console.log("[toggleSequencerSimulator] Clearing existing simulatedSequencerTimeout.");
                        clearTimeout(simulatedSequencerTimeout);
                    }

                    if (nextSimulatedSequencerTime === null) {
                        nextSimulatedSequencerTime = context.currentTime + stepInterval;
                        console.log("[toggleSequencerSimulator] Initializing nextSimulatedSequencerTime:", nextSimulatedSequencerTime);
                    }

                    // Start the scheduling
                    scheduleNextSimulatedStep();
                    console.log("[toggleSequencerSimulator] Scheduling next simulated step.");

                    // Update button text
                    document.querySelector("button").textContent = "Switch to External Listening Mode";
                    console.log("[toggleSequencerSimulator] Button text updated to: Switch to External Listening Mode.");

                    // Toggle the mode for next click
                    isSimulatedMode = false;
                    console.log("[toggleSequencerSimulator] isSimulatedMode set to false.");

                    // Set the simulator running flag to true
                    isSimulatorRunning = true;
                    console.log("[toggleSequencerSimulator] isSimulatorRunning set to true.");

                    // Set the external mode flag to false
                    isExternalModeActive = false;
                    console.log("[toggleSequencerSimulator] isExternalModeActive set to false.");

                } else {
                    console.log("[toggleSequencerSimulator] Switching to External Mode.");

                    // Stop the arpeggiator if it's running
                    if (arpTimeout) {
                        console.log("[toggleSequencerSimulator] Clearing existing arpTimeout.");
                        clearTimeout(arpTimeout);
                    }

                    // Update button text
                    document.querySelector("button").textContent = "Switch to Simulated Mode";
                    console.log("[toggleSequencerSimulator] Button text updated to: Switch to Simulated Mode.");

                    // Toggle the mode for next click
                    isSimulatedMode = true;
                    console.log("[toggleSequencerSimulator] isSimulatedMode set to true.");

                    // Set the simulator running flag to false
                    isSimulatorRunning = false;
                    console.log("[toggleSequencerSimulator] isSimulatorRunning set to false.");

                    // Set the external mode flag to true
                    isExternalModeActive = true;
                    console.log("[toggleSequencerSimulator] isExternalModeActive set to true.");
                }
            } else {
                console.log("[toggleSequencerSimulator] Simulator is already running. Stopping simulator.");

                // Stop the simulator
                if (simulatedSequencerTimeout) {
                    console.log("[toggleSequencerSimulator] Clearing existing simulatedSequencerTimeout.");
                    clearTimeout(simulatedSequencerTimeout);
                    simulatedSequencerTimeout = null;
                }

                // Update button text to reflect the mode
                document.querySelector("button").textContent = isSimulatedMode ? "Start Sequencer Simulator" : "Switch to External Listening Mode";
                console.log("[toggleSequencerSimulator] Button text updated based on isSimulatedMode value.");

                // Set the simulator running flag to false
                isSimulatorRunning = false;
                console.log("[toggleSequencerSimulator] isSimulatorRunning set to false.");
            }
        }




        function scheduleNextSimulatedStep() {
            const bpm = 105;
            const beatsPerSecond = bpm / 60; // How many beats in one second
            const stepInterval = 1 / (beatsPerSecond * 4); // 1/4 of each beat, in seconds

            const timeUntilNextSimulatedStep = (nextSimulatedSequencerTime - context.currentTime) * 1000; // Convert to milliseconds

            simulatedSequencerTimeout = setTimeout(() => {
            simulatedCurrentStep = (simulatedCurrentStep + 1) % 64; // Increment directly

                const idealStepForArpStart = simulatedCurrentStep % arpNotes.length;
                if (simulatedCurrentStep === idealStepForArpStart) {
                    currentArpIndex = 0;
                }

                // Call the onSequencerStep only if the checkbox is checked
                if (document.getElementById("useSequencerTiming").checked) {
                    onSequencerStep(simulatedCurrentStep);
                }

                // For simulation purposes, we can log the current step
                console.log(`[ms10] Sequencer Simulated Step: ${simulatedCurrentStep}`);

                nextSimulatedSequencerTime += stepInterval; // Schedule the next step
                scheduleNextSimulatedStep(); // Recursively call this function
            }, timeUntilNextSimulatedStep);
        }