var voices = new Array();
var audioContext = null;

// This is the "initial patch" of the ADSR settings.  YMMV.
var currentEnvA = 3;
var currentEnvD = 35;
var currentEnvS = 100;
var currentEnvR = 10;

// end initial patch

// the onscreen keyboard "ASCII-key-to-MIDI-note" conversion array
var keys = new Array( 256 );
keys[81] = 60; // = C4 ("middle C")
keys[50] = 61;
keys[87] = 62;
keys[51] = 63;
keys[69] = 64;
keys[82] = 65; // = F4
keys[53] = 66;
keys[84] = 67;
keys[54] = 68;
keys[90] = 69;
keys[55] = 70;
keys[85] = 71;

keys[86] = 72; // = C5
keys[71] = 73;
keys[66] = 74;
keys[72] = 75; 
keys[78] = 76;
keys[77] = 77;
keys[75] = 78;
keys[188] = 79;
keys[76] = 80; // = F5
keys[190] = 81;
keys[192] = 82;
keys[189] = 83;

var effectChain = null;
var revNode = null;
var revGain = null;
var revBypassGain = null;

function impulseResponse( duration, decay ) {
    var sampleRate = audioContext.sampleRate;
    var length = sampleRate * duration;
    var impulse = audioContext.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++){
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function noteOn( note, velocity ) {
	if (voices[note] == null) {
		// Create a new synth node
		voices[note] = new Voice(note, velocity);
		var e = document.getElementById( "k" + note );
		if (e)
			e.classList.add("pressed");
	}
}

function noteOff( note ) {
	if (voices[note] != null) {
		// Shut off the note playing and clear it 
		voices[note].noteOff();
		voices[note] = null;
		var e = document.getElementById( "k" + note );
		if (e)
			e.classList.remove("pressed");
	}

}

// 'value' is normalized to 0..1.
function controller( number, value ) {
	switch (number) {
		case 1:
			// do something with CC#1
			break;
		case 2:
			// do something with CC#2
			break;
	}
}

// 'value' is normalized to [-1,1]
function pitchWheel( value ) {
	var i;
	
	for (i in voices) {
		if (voices[i] && voices[i].osc)
			voices[i].osc.detune.value = value * 500;	// value in cents - detune major fifth.
	}
}

function Voice( note, velocity ) {
	this.originalFrequency = frequencyFromNoteNumber( note );

	// create oscillator
	this.osc = audioContext.createOscillator();
	this.osc.frequency.setValueAtTime(this.originalFrequency, 0);

	// create the volume envelope
	this.envelope = audioContext.createGainNode();
	this.osc.connect( this.envelope );
	this.envelope.connect( effectChain );

	// set up the volume ADSR envelope
	var now = audioContext.currentTime;
	var envAttackEnd = now + (currentEnvA/10.0);

	this.envelope.gain.value = 0.0;
	this.envelope.gain.setValueAtTime( 0.0, now );
	this.envelope.gain.linearRampToValueAtTime( 1.0, envAttackEnd );
	this.envelope.gain.setTargetValueAtTime( (currentEnvS/100.0), envAttackEnd, (currentEnvD/100.0)+0.001 );

	this.osc.noteOn(0);
}

Voice.prototype.noteOff = function() {
	var now =  audioContext.currentTime;
	var release = now + (currentEnvR/10.0);	

	this.envelope.gain.cancelScheduledValues(now);
	this.envelope.gain.setValueAtTime( this.envelope.gain.value, now );  // this is necessary because of the linear ramp
	this.envelope.gain.setTargetValueAtTime(0.0, now, (currentEnvR/100));

	this.osc.noteOff( release );
}

var currentOctave = 3;

function keyDown( ev ) {
	var note = keys[ev.keyCode];
	if (note){
		noteOn( note + 12*(3-currentOctave), 0.75 );
		//console.log( "key down: " + ev.keyCode );	
		add_note(note); // begins recording this note
	}
		

	var e = document.getElementById( "k" + note );
	if (e)
		e.classList.add("pressed");
	return false;
}

function keyUp( ev ) {
	var note = keys[ev.keyCode];
	if (note){
		noteOff( note + 12*(3-currentOctave) );
		//console.log( "key up: " + ev.keyCode );		
		remove_note(note);  // stops recording this note
	}
		
	
	var e = document.getElementById( "k" + note );
	if (e)
		e.classList.remove("pressed");
	return false;
}

function pointerDown( ev ) {
	var note = parseInt( ev.target.id.substring( 1 ) );
	if (note != NaN){
		noteOn( note + 12*(3-currentOctave), 0.75 );
		//console.log( "mouse down: " + note );
		add_note(note); // begins recording this note		
	}
		
	
	ev.target.classList.add("pressed");
	return false;
}

function pointerUp( ev ) {
	var note = parseInt( ev.target.id.substring( 1 ) );
	if (note != NaN){
		noteOff( note + 12*(3-currentOctave) );
		//console.log( "mouse up: " + note );
		remove_note(note);  // stops recording this note
	}
		
	
	ev.target.classList.remove("pressed");
	return false;
}

function initAudio() {
	try {
    	audioContext = new AudioContext();
  	}
  	catch(e) {
    	alert('Web Audio API is not supported in this browser');
  	}

	window.addEventListener('keydown', keyDown, false);
	window.addEventListener('keyup', keyUp, false);

	// set up the master effects chain for all voices to connect to.

	// connection point for all voices
	effectChain = audioContext.createGainNode();

	// convolver for a global reverb - just an example "global effect"
    revNode = audioContext.createGainNode(); // createConvolver();

    // gain for reverb
	revGain = audioContext.createGainNode();
	revGain.gain.value = 0.1;

	// gain for reverb bypass.  Balance between this and the previous = effect mix.
	revBypassGain = audioContext.createGainNode();

	// overall volume control node
    volNode = audioContext.createGainNode();
    volNode.gain.value = 0.25;

    effectChain.connect( revNode );
    effectChain.connect( revBypassGain );
    revNode.connect( revGain );
    revGain.connect( volNode );
    revBypassGain.connect( volNode );

    // hook it up to the "speakers"
    volNode.connect( audioContext.destination );

    // Synthesize a reverb impulse response (could use XHR to download one).
	//	revNode.buffer = impulseResponse( 5.0, 2.0 );

	synthBox = document.getElementById("synthbox");

	var keys = document.querySelectorAll( ".key" );
	for (var i=0; i<keys.length; i++) {
		keys[i].addEventListener('pointerdown', pointerDown);
		keys[i].addEventListener('pointerup', pointerUp);
	}
	var kbOct = document.getElementById("kbd_oct");
	kbOct.onchange = function() { 
		currentOctave = document.getElementById("kbd_oct").selectedIndex; 
		console.log( "kbOct changed" );
	}
	
}

window.onload=initAudio;
