// saveLoadMidiRecordingJsonFiles.js

// Abbreviate or Expand MIDI recording and settings based on the operation

function expandData(data) {
    // Expand the MIDI recording array
    if (data.mR) {
        data.midiRecording = data.mR.map(rec => ({
            timestamp: rec.ts,
            message: rec.msg
        }));
        delete data.mR;
    }

    // Correctly expand settings - Fix applied here
    if (data.st) {
        data.settings = expandSettings(data.st); // Use a corrected function for expanding settings
        delete data.st;
    }

    return data;
}

// New function to correctly expand abbreviated settings back to their full names
function expandSettings(abbreviatedSettings) {
    const fullNames = {
        wf: 'waveform',
        nt: 'note',
        atk: 'attack',
        rls: 'release',
        ctf: 'cutoff',
        rsn: 'resonance',
        vol: 'volume'
    };

    return Object.keys(abbreviatedSettings).reduce((acc, abbrevKey) => {
        const fullKey = fullNames[abbrevKey] || abbrevKey; // Fallback to original key if no match found
        acc[fullKey] = abbreviatedSettings[abbrevKey];
        return acc;
    }, {});
}

function processMidiData(data, operation = 'abbreviate') {
    const abbreviations = {
        midiRecording: 'mR',
        timestamp: 'ts',
        message: 'msg',
        settings: 'st',
        waveform: 'wf',
        note: 'nt',
        attack: 'atk',
        release: 'rls',
        cutoff: 'ctf',
        resonance: 'rsn',
        volume: 'vol'
    };

    const processData = (obj, isAbbreviating) => {
        return Object.keys(obj).reduce((acc, key) => {
            const newKey = isAbbreviating ? abbreviations[key] || key : Object.keys(abbreviations).find(k => abbreviations[k] === key) || key;
            acc[newKey] = obj[key];
            return acc;
        }, {});
    };

    if (operation === 'abbreviate') {
        if (data.midiRecording) {
            data.mR = data.midiRecording.map(rec => processData(rec, true));
            delete data.midiRecording;
        }
        if (data.settings) {
            data.st = processData(data.settings, true);
            delete data.settings;
        }
    } else { // Expand
        if (data.mR) {
            data.midiRecording = data.mR.map(rec => processData(rec, false));
            delete data.mR;
        }
        if (data.st) {
            data.settings = processData(data.st, false);
            delete data.st;
        }
    }

    return data;
}

function getSynthSettings() {
    const settingsKeys = ['waveform', 'note', 'attack', 'release', 'cutoff', 'resonance', 'volume'];
    const settings = settingsKeys.reduce((acc, key) => {
        acc[key] = document.getElementById(key).value;
        return acc;
    }, {});

    console.log('[getSynthSettings] playbackRecordingDEBUG - Retrieved synth settings:', settings);
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
    data = processMidiData(data);

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
    Object.keys(settings).forEach(key => {
        const slider = document.getElementById(key);
        if (slider) {
            slider.value = settings[key];
            slider.dispatchEvent(new Event('input'));
        }
    });
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