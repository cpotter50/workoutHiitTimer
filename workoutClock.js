let timerGoing = false;
let restartClock = false;
let currentTime = 0;
let deciseconds = 0;
let seconds = 0;
let minutes = 0;
let startTime;
let pauseStartTime;
let pauseCurrentTime = 0;
let totalPauseTime = 0;
let timerIntervalId;
let pauserIntervalId;

let clockDOM, playButtonMainDOM, decisecondsDOM, addTimerButtonDOM,
	audioSourceDOM, timerMakerAlarmDOM, audioPlayerDOM, intervalAlarmPlayerDOM,
	audioPlayerHiddenDOM;

function Setup () {
	clockDOM = document.getElementById ("clock");
	playButtonMainDOM = document.getElementById ("playButtonMain");
		playButtonMainDOM.onclick = ToggleClock;
	decisecondsDOM = document.getElementById ("deciseconds");
	addTimerButtonDOM = document.getElementById ("addTimerButton");
		addTimerButtonDOM.onclick = CreateIntervalClock;
	audioSourceDOM = document.getElementById ("audioSource");
	timerMakerAlarmDOM = document.getElementById ("timerMakerAlarm");
	audioPlayerDOM = document.getElementById ("audioPlayer");
		timerMakerAlarmDOM.onclick = SetAudioSource;
	intervalAlarmPlayerDOM = document.getElementById ("intervalAlarmPlayer");
	audioPlayerHiddenDOM = document.getElementById ("audioPlayerHidden");
	
	SetupIntervalTool ();
}

function SetAudioSource () {
	//console.log ("You clicked: ", this.value);
	audioSourceDOM.src = this.value;
	audioPlayerDOM.load ();	
}

function ToggleClock () {
	//console.log ("starting timer")
	timerGoing = !timerGoing;
	
	if (!startTime || restartClock) {
		startTime = Date.now ();
		restartClock = false;
	}
	
	if (timerGoing) {
		totalPauseTime += pauseCurrentTime;
		timerIntervalId = setInterval (IncreaseTimer, 30);
		
		if (pauserIntervalId) {
			clearInterval (pauserIntervalId);
		}
		
	} else {
		clearInterval (timerIntervalId);
		
		pauseStartTime = Date.now ();	
		pauserIntervalId = setInterval (IncreasePauseTimer, 30);
	}
	
	audioPlayerHiddenDOM.load ();
	audioPlayerHiddenDOM.play ();
	
	
	TogglePlayButtonGraphics ();
	ToggleIntervalPlayButton ();
}

function TogglePlayButtonGraphics () {
	let pathBase = "img_button_";
	
	if (!timerGoing) {
		playButtonMainDOM.src = pathBase + "play2.png" 
		playButtonMainDOM.onmouseover = function () {
			this.src= pathBase + 'play2.png'
		}
		playButtonMainDOM.onmouseout = function () {
			this.src= pathBase + 'play1.png'
		}
	} else {
		playButtonMainDOM.src= pathBase + "pause2.png" 
		playButtonMainDOM.onmouseover = function () {
			this.src= pathBase + 'pause2.png'
		}
		playButtonMainDOM.onmouseout = function () {
			this.src= pathBase + 'pause1.png'
		}
	}
}

function IncreaseTimer () {
	currentTime = Date.now () - (startTime + totalPauseTime);

	deciseconds = Math.floor (currentTime / 10);
	seconds = Math.floor (currentTime / 1000);
	minutes = Math.floor (seconds / 60);
	
	DisplayCurrentTime ();
	UpdateIntervalArray ();
	
	console.log ("Increasing timer...");
}

function IncreasePauseTimer () {
	pauseCurrentTime = Date.now () - pauseStartTime;
	//console.log ("pause time elapsed...", Math.floor (pauseCurrentTime / 1000));

	console.log ("Increasing pause timer...");	
}

function DisplayCurrentTime () {
	let minutesText, secondsText, decisecondsText;
	let tensPlace, hundredsPlace;
	
	
	decisecondsText = deciseconds.toString();
	if (decisecondsText.length > 1) {
		decisecondsText = decisecondsText.substr (decisecondsText.length - 2);
	} else {
		deciseconds = "0" + decisecondsText;
	}

	secondsText = seconds - (60 * minutes);
	if (secondsText < 10) {
		secondsText = "0" + secondsText.toString();
	}
	
	minutesText = minutes.toString ();
	if (minutesText < 10) {
		minutesText = "0" + minutesText.toString();
	}
	
	currentTime = minutesText + ":" + secondsText;
	clockDOM.innerHTML = currentTime;
	decisecondsDOM.innerHTML = decisecondsText;
}

function ResetClock () {
	//if the clock is running, stop it.
	if (timerGoing) {
		console.log ("Timer was going, resetting clock");
		ToggleClock ();
	}
	
	clearInterval (pauserIntervalId);
	clearInterval (timerIntervalId);
	
	//console.log ("resetting the clock");
	//startTime = Date.now ();
	//pauseStartTime = Date.now ();
	totalPauseTime = 0;
	currentTime = 0;
	deciseconds = 0;
	seconds = 0;
	minutes = 0;
	pauseCurrentTime = 0;
	totalPauseTime = 0;
	
	DisplayCurrentTime ();
	UpdateIntervalArray ();
	//IncreaseTimer ();
	restartClock = true;
}

window.onload = Setup;
