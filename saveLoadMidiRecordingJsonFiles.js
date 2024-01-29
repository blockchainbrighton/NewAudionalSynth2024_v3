// saveLoadMidiRecordingJsonFiles.js

// Helper function to abbreviate properties of MIDI recording and settings
function abbreviateData(data) {
    // Abbreviate the MIDI recording array
    if (data.midiRecording) {
        data.mR = data.midiRecording.map(rec => ({
            ts: parseFloat(rec.timestamp.toFixed(3)),
            msg: rec.message
        }));
        delete data.midiRecording;
    }

    // Abbreviate settings
    if (data.settings) {
        data.st = abbreviateSettings(data.settings);
        delete data.settings;
    }

    return data;
}

// Helper function to expand abbreviated properties
function expandData(data) {
    // Expand the MIDI recording array
    if (data.mR) {
        data.midiRecording = data.mR.map(rec => ({
            timestamp: rec.ts,
            message: rec.msg
        }));
        delete data.mR;
    }

    // Expand settings
    if (data.st) {
        data.settings = abbreviateSettings(data.st, false);
        delete data.st;
    }

    return data;
}

// Helper function to map settings to abbreviated form and vice versa
function abbreviateSettings(settings, isAbbreviating = true) {
    const mapping = {
        waveform: 'wf',
        note: 'nt',
        attack: 'atk',
        release: 'rls',
        cutoff: 'ctf',
        resonance: 'rsn',
        volume: 'vol'
    };

    const result = {};
    for (const key in settings) {
        const newKey = isAbbreviating ? mapping[key] : Object.keys(mapping).find(k => mapping[k] === key);
        result[newKey] = settings[key];
    }
    return result;
}

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

// Updated save function
function saveMIDIRecording() {
    console.log(`Saving MIDI Recording:`, midiRecording);

    const settings = getSynthSettings();
    let data = {
        midiRecording: midiRecording,  // Saving the entire midiRecording array without filtering
        settings: settings
    };

    // Abbreviate data
    data = abbreviateData(data);

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

            let data = JSON.parse(event.target.result);

            // Expand data
            data = expandData(data);

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
    console.log('[setSynthSettings] playbackRecordingDEBUG - Setting loaded synth settings:', settings);

    // Helper function to update slider value and dispatch event
    function updateSlider(elementId, value) {
        const slider = document.getElementById(elementId);
        if (slider) {
            slider.value = value;
            slider.dispatchEvent(new Event('input'));
        }
    }

    // Set synth settings from the provided object
    updateSlider('waveform', settings.waveform);
    updateSlider('note', settings.note);
    updateSlider('attack', settings.attack);
    updateSlider('release', settings.release);
    updateSlider('cutoff', settings.cutoff);
    updateSlider('resonance', settings.resonance);
    updateSlider('volume', settings.volume);

    console.log('Synth settings set:', settings);
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
