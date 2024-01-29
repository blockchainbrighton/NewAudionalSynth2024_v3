// recorder.js

let audioContext;
let mediaRecorder;
let recordedChunks = [];
let audioUrl = '';
let isRecording = false;

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
            };
        })
        .catch(err => console.error('Error accessing media devices.', err));
};

function startRecording() {
    if (mediaRecorder && !isRecording) {
        mediaRecorder.start();
        isRecording = true;
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
    }
}

// Add event listeners to buttons
document.getElementById('recordButton').addEventListener('click', startRecording);
document.getElementById('stopRecordButton').addEventListener('click', stopRecording);
document.getElementById('playRecordButton').addEventListener('click', playRecording);
