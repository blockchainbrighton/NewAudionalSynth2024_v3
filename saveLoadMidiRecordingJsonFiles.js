// saveLoadMidiRecordingJsonFiles.js

function getSynthSettings() {
    // Retrieve synth settings from the DOM or any relevant variables
    return {
        waveform: document.getElementById('waveform').value,
        note: document.getElementById('note').value,
        attack: document.getElementById('attack').value,
        release: document.getElementById('release').value,
        cutoff: document.getElementById('cutoff').value,
        resonance: document.getElementById('resonance').value,
        volume: getVolume() // Assuming this function returns the current volume
        // Add other settings here as needed
    };
}

function saveMIDIRecording() {
    const data = {
        midiRecording: midiRecording,
        settings: getSynthSettings()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "midiRecording.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function loadMIDIRecording(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = JSON.parse(event.target.result);
            midiRecording = data.midiRecording;
            // Apply the settings
            setSynthSettings(data.settings);
            console.log('MIDI Recording and settings loaded');
        };
        reader.readAsText(file);
    }
}

function setSynthSettings(settings) {
    // Set synth settings from the provided object
    document.getElementById('waveform').value = settings.waveform;
    document.getElementById('note').value = settings.note;
    document.getElementById('attack').value = settings.attack;
    document.getElementById('release').value = settings.release;
    document.getElementById('cutoff').value = settings.cutoff;
    document.getElementById('resonance').value = settings.resonance;
    setVolume(settings.volume); // Assuming this function sets the volume
    // Apply other settings here as needed
}

// Event listener to download the JSON file
document.getElementById('createMidiJsonFile').addEventListener('click', saveMIDIRecording);

// Event listener for file input to load a JSON file
document.getElementById('loadMidiJsonFile').addEventListener('change', loadMIDIRecording);

function addSaveLoadEventListeners() {
    // Add any additional event listeners if needed
}

addSaveLoadEventListeners();
