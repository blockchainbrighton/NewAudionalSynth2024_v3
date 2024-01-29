// recorder.js

let audioContext;
let mediaRecorder;
let recordedChunks = [];
let audioUrl = '';
let isRecording = false;
let metronomeCount = 0;

window.onload = function() {
    audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const mediaStreamSource = audioContext.createMediaStreamSource(stream);
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = function(e) {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = function() {
                audioUrl = URL.createObjectURL(new Blob(recordedChunks));
                recordedChunks = [];
                document.getElementById('recordButton').classList.remove('active');
            };
        })
        .catch(err => console.error('Error accessing media devices.', err));
};

function playMetronome() {
    // Metronome sound (a simple beep for example) should be played here
    // For simplicity, we're using console.log
    console.log('Metronome Click');

    metronomeCount++;
    if (metronomeCount >= 4) {
        clearInterval(metronomeInterval);
        startRecording();
    }
}

function prepareToRecord() {
    metronomeCount = 0;
    metronomeInterval = setInterval(playMetronome, 500); // 500ms for a simple 4/4 count
}

function startRecording() {
    if (mediaRecorder && !isRecording) {
        mediaRecorder.start();
        isRecording = true;
        document.getElementById('recordButton').classList.add('active');
        console.log('Recording started');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        console.log('Recording stopped');
    }
}

function playRecording() {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onplay = () => document.getElementById('playRecordButton').classList.add('active');
        audio.onended = () => document.getElementById('playRecordButton').classList.remove('active');
    }
}

// Add event listeners to buttons
document.getElementById('recordButton').addEventListener('click', prepareToRecord);
document.getElementById('stopRecordButton').addEventListener('click', stopRecording);
document.getElementById('playRecordButton').addEventListener('click', playRecording);
