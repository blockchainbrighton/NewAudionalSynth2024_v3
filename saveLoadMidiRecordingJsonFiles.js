// saveLoadMidiRecordingJsonFiles.js



function getSynthSettings() {
    const settings = {
        waveform: document.getElementById('waveform').value,
        note: document.getElementById('note').value,
        attack: document.getElementById('attack').value,
        release: document.getElementById('release').value,
        cutoff: document.getElementById('cutoff').value,
        resonance: document.getElementById('resonance').value,
        volume: document.getElementById('volume').value 

    };
    console.log('[getSynthSettings] playbackRecordingDEBUG - Retrieved synth settings:', settings); // Log the retrieved settings
    return settings;
}


function compressData(data) {
    // Directly compress data into numerical arrays
    let compressedRecording = data.midiRecording.map(rec => [
        parseFloat(rec.timestamp.toFixed(3)),
        ...Object.values(rec.message)
    ]);
    let compressedSettings = Object.values(data.settings);

    return [compressedRecording, compressedSettings];
}

function decompressData(compressedData) {
    // Directly decompress data from numerical arrays
    let decompressedRecording = compressedData[0].map(rec => ({
        timestamp: rec[0],
        message: { '0': rec[1], '1': rec[2], '2': rec[3] }
    }));
    let decompressedSettings = {
        waveform: compressedData[1][0],
        note: compressedData[1][1],
        attack: compressedData[1][2],
        release: compressedData[1][3],
        cutoff: compressedData[1][4],
        resonance: compressedData[1][5],
        volume: compressedData[1][6]
    };

    return { midiRecording: decompressedRecording, settings: decompressedSettings };
}

function saveMIDIRecording() {
    console.log(`Saving MIDI Recording:`, midiRecording);

    const settings = getSynthSettings();
    let data = {
        midiRecording: midiRecording,
        settings: getSynthSettings()
    };

    data = compressData(data);

    console.log('Data to be saved:', data); // Log the data to be saved

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "midiRecording.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    console.log('MIDI Recording and settings saved'); // Log the save action
}






// Updated load function
function loadMIDIRecording(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('File selected for loading:', file.name); // Log the file name

        const reader = new FileReader();
        reader.onload = function(event) {
            console.log('File read completed'); // Log file read completion

            let compressedData = JSON.parse(event.target.result);
            // First, decompress data
            let data = decompressData(compressedData);
        
            console.log('Parsed data from file:', data); // Log the parsed data

            midiRecording = data.midiRecording;
            console.log('Loaded MIDI recording:', midiRecording); // Log the loaded MIDI recording

            // Apply the settings
            setSynthSettings(data.settings);
            console.log('Synth settings applied:', data.settings); // Log the applied settings

            console.log('MIDI Recording and settings loaded');
        };
        reader.readAsText(file);
    } else {
        console.log('No file selected'); // Log if no file is selected
    }
}

function setSynthSettings(settings) {
    console.log('[setSynthSettings] - Setting loaded synth settings:', settings);

    // Update the values of the UI elements
    document.getElementById('waveform').value = settings.waveform || 'sawtooth'; // Default value if undefined
    document.getElementById('note').value = settings.note || 'C1'; // Default note value
    document.getElementById('attack').value = settings.attack || '0.01'; // Default attack time
    document.getElementById('release').value = settings.release || '0.5'; // Default release time
    document.getElementById('cutoff').value = settings.cutoff || '2000'; // Default cutoff frequency
    document.getElementById('resonance').value = settings.resonance || '5'; // Default resonance value
    document.getElementById('volume').value = settings.volume || '100'; // Default volume level

    // Dispatch an event to update the UI if the sliders are using 'change' event listeners
    ['waveform', 'note', 'attack', 'release', 'cutoff', 'resonance', 'volume'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.dispatchEvent(new Event('change', { 'bubbles': true }));
        }
    });

    console.log('Synth settings applied to UI:', settings);
}



// Event listeners setup
document.getElementById('createMidiJsonFile').addEventListener('click', saveMIDIRecording);
document.getElementById('loadMidiJsonFile').addEventListener('change', loadMIDIRecording);
document.getElementById('playMIDIRecordButton').addEventListener('click', () => {
    console.log('Play MIDI Recording button clicked');
});

function addSaveLoadEventListeners() {
    // Add any additional event listeners if needed
    console.log('Additional save/load event listeners added if needed'); // Log the addition of any extra event listeners
}

addSaveLoadEventListeners();
