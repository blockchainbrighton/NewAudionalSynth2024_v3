 // eventListeners.js
        // Assign the playArp function to the button
        document.getElementById("playArp").addEventListener("click", playArpeggiator);
        document.getElementById("pauseArp").addEventListener("click", pauseArpeggiator);

       




        const sequencerChannel = new BroadcastChannel('sequencerChannel');

        sequencerChannel.addEventListener("message", (event) => {
            if (event.data.type === 'step') {
                console.log(`[ms10 messageEventListener] Received step: ${event.data.data.step}`);
                onSequencerStep(event.data.data.step);

                // Clear any existing timeout since we've received an external step
                if (externalStepTimeout) {
                    clearTimeout(externalStepTimeout);
                }

                // Set a new timeout to check if we receive another step in the next 2 seconds (or any other reasonable duration)
                externalStepTimeout = setTimeout(() => {
                    console.log(`[ms10] No external steps received for an extended period. Stopping arpeggiator.`);
                    stopArpeggiator();
                }, 250);  // Timeout duration can be adjusted based on your needs
            }
        });




      

document.getElementById("addRest").addEventListener("click", function() {
    arpNotes.push(null); // Using null to represent a rest
    updateArpNotesDisplay();
});

// Add an event listener to detect nudge slider activity
document.getElementById("timingAdjust").addEventListener('input', function() {
    isNudgeActive = true;
});

document.getElementById("timingAdjust").addEventListener('change', function() {
    isNudgeActive = false; // Reset when the user stops adjusting the slider
});