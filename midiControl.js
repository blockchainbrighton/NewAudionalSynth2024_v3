 // midiControl.js
        const A4_MIDI_NUMBER = 69;
        const A4_FREQUENCY = 440;
        const arpNoteNames = [];

    

        function onMIDISuccess(e) {
            let o = e.inputs.values();
            for (let e = o.next(); e && !e.done; e = o.next()) {
                e.value.onmidimessage = onMIDIMessage;
            }
        }

        function onMIDIFailure() {
            console.warn("Could not access your MIDI devices.");
        }

        function onMIDIMessage(e) {
            console.log("Received MIDI message:", e.data);

            if (typeof window.recordMIDIEvent === 'function') {
                window.recordMIDIEvent(e.data);
            }

            let o = 240 & e.data[0];
            let n = e.data[1];
            let t = e.data.length > 2 ? e.data[2] : 0;

            switch (o) {
                case 144:
                    if (t > 0) {
                        let e = midiNoteToFrequency(n);
                        console.log(`Note On. MIDI note: ${n}, Frequency: ${e}`);
                        if (isArpeggiatorOn) {
                            arpNotes.push(e);
                            updateArpNotesDisplay();
                        } else {
                            playMS10TriangleBass(e, t / 127);
                        }
                    }
                    break;
                case 128:
                    console.log(`Note Off. MIDI note: ${n}`);
                    if (isArpeggiatorOn) {
                        let e = midiNoteToFrequency(n);
                        let o = arpNotes.indexOf(e);
                        if (o !== -1) arpNotes.splice(o, 1);
                    }
                    break;
                default:
                    console.log(`Unhandled MIDI message type: ${o}`);
            }
        }

        function midiNoteToFrequency(e) {
            return e < 0 || e > 127 ? (console.error("Invalid MIDI note:", e), null) : Math.pow(2, (e - A4_MIDI_NUMBER) / 12) * A4_FREQUENCY;
        }

        function playNote(e, o = 1) {
            let n = 440 * Math.pow(2, (e - 69) / 12);
            playMS10TriangleBass(n, o);
        }

        function stopNote(e) {}

        function getVolume() {
            return document.getElementById("volume").value / 100;
        }

        navigator.requestMIDIAccess ? navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure) : console.warn("WebMIDI is not supported in this browser.");
       
        // Add playback functionality
        function playBackMIDI() {
            if (midiRecording.length > 0) {
                playbackStartTime = performance.now();
                nextEventIndex = 0;
                playbackInterval = setInterval(playbackNextMIDIEvent, 0);
                console.log('Playback started');
            }
        }

        function playbackNextMIDIEvent() {
            if (nextEventIndex < midiRecording.length) {
                const now = performance.now() - playbackStartTime;
                const nextEvent = midiRecording[nextEventIndex];
                if (now >= nextEvent.timestamp) {
                    onMIDIMessage({ data: nextEvent.message }); // Reuse onMIDIMessage for playback
                    nextEventIndex++;
                }
            } else {
                clearInterval(playbackInterval);
                console.log('Playback stopped');
            }
        }

        // Add event listeners for the buttons in your JavaScript code
        document.getElementById('recordMIDIButton').addEventListener('click', startMIDIRecording);
        document.getElementById('stopMIDIRecordButton').addEventListener('click', stopMIDIRecording);
        document.getElementById('playMIDIRecordButton').addEventListener('click', playBackMIDI);
