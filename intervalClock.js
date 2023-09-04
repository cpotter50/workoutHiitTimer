let activeIntervals = [];
let justDroppedId = 0;

let intervalMakerMinutesDOM, intervalMakerSecondsDOM, intervalMakerAlarmDOM,
	timerContainerDOM;

function SetupIntervalTool () {
	intervalMakerMinutesDOM = document.getElementById ("timerMakerMinutes");
	intervalMakerSecondsDOM = document.getElementById ("timerMakerSeconds");
	intervalMakerAlarmDOM = document.getElementById   ("timerMakerAlarm");
	timerContainerDOM = document.getElementById ("timerContainer");
	
	//give the timer container its sorting functionality.
	timerContainerDOM.addEventListener ('dragover', e => {
		e.preventDefault ();
		let draggedTimer = document.querySelector (".beingDragged");
		let afterElement = getDragAfterElement (e.clientY);
		//console.log (afterElement);
		
		if (afterElement == null) {
			timerContainerDOM.appendChild (draggedTimer);	
		} else {
			timerContainerDOM.insertBefore (draggedTimer, afterElement);
		}
	});
	
	/*
	intervalMakerSecondsDOM.value = 1;
	CreateIntervalClock ();
	intervalMakerSecondsDOM.value = 2;
	CreateIntervalClock ();
	intervalMakerSecondsDOM.value = 3;
	CreateIntervalClock ();
	intervalMakerSecondsDOM.value = 4;
	CreateIntervalClock ();
	*/

	/*
	intervalMakerSecondsDOM.value = 5;
	CreateIntervalClock ();
	CreateIntervalClock ();
	CreateIntervalClock ();
	CreateIntervalClock ();
	CreateIntervalClock ();
	*/
}

function getDragAfterElement (y) {
	let container = timerContainerDOM;
	let draggableElements = [...container.querySelectorAll ('.draggable:not(.beingDragged)')];
	
	return draggableElements.reduce ((closest, child) => {
		const box = child.getBoundingClientRect ();
		const offset = y - box.top - box.height / 2;
		
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child };
		} else {
			return closest;
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element
}

function CreateIntervalClock () {
	let seconds, minutes, totalSeconds, alarm;
	
	//convert the form data from a string to a number
	seconds = Number(intervalMakerSecondsDOM.value);
	minutes = Number(intervalMakerMinutesDOM.value);
	
	//Sanitize negative numbers into 0's.
	if (seconds < 0) {
		seconds = 0;
	}
	if (minutes < 0) {
		minutes = 0;
	}
	
	//if the user entered a value of seconds greater than 60:
	if (seconds >= 60) {
		//figure out how many multiples of 60 are in the seconds place.
		//add to the number of minutes that result.
		//subtract from the seconds place: that result * 60 to leave a remainder that is below 60.
		
		let tempMinutes = Math.floor (seconds / 60);
		minutes += tempMinutes;
		seconds -= tempMinutes * 60;
	}
	
	//if the minutes column was empty, make it 0.
	if (minutes == null) {
		minutes = 0;
	}
	
	//if there was no information entered into the seconds column and the minutes section does not have a value, then make it 30 seconds
	if (seconds == null && minutes === 0 || 
		seconds == 0 && minutes === 0) {
		seconds = 30;
	}
	
	//console.log ("Seconds: " + seconds);
	//console.log ("Minutes: " + minutes);
	
	//store a reference of total seconds to make interval calculation easier.
	totalSeconds = (minutes * 60) + seconds;
	
	//setup the variables that an interval timer needs
	let intervalTimer = new Object ();
		intervalTimer.startTime = 0;
		intervalTimer.currentTime = 0;
		intervalTimer.playSound = "honk";
		intervalTimer.rank = 0;
		intervalTimer.seconds = seconds;
		intervalTimer.minutes = minutes;
		intervalTimer.totalSeconds = totalSeconds;
		intervalTimer.id = new Date ().getTime () + Math.floor ((Math.random () * 1000));
		intervalTimer.audioSource = audioSourceDOM.src;
		
		//get the file name and isolate it from the path name. 
		let audioName = audioSourceDOM.src.split ("/");
		intervalTimer.audioName = audioName [audioName.length -1];
		//console.log (audioSourceDOM);
	
	//create a reference to this timer by pushing it into the array of timers.
	activeIntervals.push (intervalTimer);
	//the timer's rank is the same as the integer used to accesss it from the array.
	intervalTimer.rank = activeIntervals.length -1;
	
	//tell the array that it has been updated.
	UpdateIntervalArray ();
	
	ResetClock ();
}

//this method will be called by any function that modifies the interval array.
function UpdateIntervalArray () {
	DrawIntervalTimers ();
}

function DrawIntervalTimers () {
	//clear the interval container
	timerContainerDOM.innerHTML = "";
	
	//for each timer in the array, build a dom element.
	activeIntervals.forEach ((currentTimer) => {
		let newTimerDOM = createTimerDOM (currentTimer);
		currentTimer.DOM = newTimerDOM;
		timerContainerDOM.appendChild (newTimerDOM);
	});
}

function createTimerDOM (timerData) {
	//create dom elements.
	//populate them with relevant info.
	//display their id now for test purposes.
	
	//the interval clock's main body.
	let intervalTimer = Spawn ("div");
	intervalTimer.id = timerData.id
	intervalTimer.className = "timer draggable";
	intervalTimer.draggable = true;
	
	//spawn the header of the timer.
	let intervalTimerHeader = Spawn ("div");
	intervalTimerHeader.className = "timerHeader"
	
	//spawn the body and its children of the timer.
	let intervalTimerBody = Spawn ("div");
		intervalTimerBody.className = "timerBody"
	let timerPlayButton = Spawn ("input");
		timerPlayButton.type = "image";
		timerPlayButton.src = "img_button_play1.png" ;
		timerPlayButton.onMouseOver = "this.src='img_button_play2.png'" ;
		timerPlayButton.onMouseOut = "this.src='img_button_play1.png'" ;
		timerPlayButton.onclick = ToggleClockFromInterval;
		timerPlayButton.classList.add ("intervalPlayButton");
		if (timerGoing) {
			timerPlayButton.classList.add ("concealed");
		}
		//timerPlayButton.classList.add ("concealed");
	let timerCounter = Spawn ("p");
		timerCounter.innerHTML = RenderTime (timerData);
	let audioName = Spawn ("p");
		audioName.innerHTML = timerData.audioName;

	//spawn the footer of the timer.
	let intervalTimerFooter = Spawn ("div");
		intervalTimerFooter.className = "timerFooter";
	let timerDeleteButton = Spawn ("button");
		timerDeleteButton.innerHTML = "x";
		timerDeleteButton.onclick = DeleteTimer;

	//attach all the pieces together.
	intervalTimer.appendChild (intervalTimerHeader);
	intervalTimer.appendChild (intervalTimerBody);
	intervalTimer.appendChild (intervalTimerFooter);
	
	//attaching the body pieces together.
	intervalTimerBody.appendChild (timerPlayButton);
	intervalTimerBody.appendChild (timerCounter);
	intervalTimerBody.appendChild (audioName);
	
	//attaching the footer pieces together.
	intervalTimerFooter.appendChild (timerDeleteButton);
	
	//giving the timer its drag-and-drop functionality.
	intervalTimer.addEventListener ('dragstart', DragStart);
	intervalTimer.addEventListener ('dragend', DragEnd);
	
	if (timerData.isActive) {
		intervalTimer.classList.add ("activeTimer");
	}
	
	//return the newly assembled dom piece.
	return intervalTimer;
}

//this is called when an interval timer is dragged
function DragStart () {
	//console.log ("dragging timer...", this.id);
	this.classList.add ("beingDragged");	
}

//this is called when an interval timer is dropped
function DragEnd () {
	//console.log ("dropping timer...", this.id);
	//this.classList.remove ("beingDragged");

	justDroppedId = this.id;
	
	RebuildIntervalTimerArrayFromDom ();
	ResetClock ();
	AnimateJustDroppedElement ();
}


//this function is run by the master clock's Toggle Clock method. 
function ToggleIntervalPlayButton () {
	//console.log ("toggling interval buttons...");
	//hide all the interval play buttons
	let playButtons = timerContainerDOM.querySelectorAll (".intervalPlayButton");
	
	playButtons.forEach ( playButton => {
		if (timerGoing) {
			playButton.classList.add ("concealed");
		} else {
			playButton.classList.remove ("concealed");
		}
	})
}

//when the user clicks the play button from an interval, this method is called instead of ToggleClock. 
function ToggleClockFromInterval () {
	ResetClock ();
	
	//set the time based on the interval that was hit.
							//the body			//the container
	let timerID = this.parentElement.parentElement.id;
	
	let targetTimer = activeIntervals.filter ( timer => {
		return timer.id == timerID;
	}) [0];
	
	let accumulatedSeconds = 0;
	
	for (let i = 0; i < activeIntervals.length; i++) {
		if (i < targetTimer.rank) {
			accumulatedSeconds	+= activeIntervals [i].totalSeconds;
		}
	}
	
	//totalPauseTime = 0;
	console.log ("date.now", Date.now (), ", total seconds: ", accumulatedSeconds, ", the timer: ", targetTimer); 
	startTime = Date.now () - (accumulatedSeconds * 1000);
	//pauseStartTime = Date.now ();
	
	//IncreaseTimer ();
	
	//tell the clock to run. 
	ToggleClock ();
}

//this is specifically for updating the activeIntervals array when the user modifies the dom.
function RebuildIntervalTimerArrayFromDom () {
	//get all of the dom elements in the timer container. Because of how they are being rendered, the order they are returned can be trusted as the order we wish to recreate.
	let newArrangement = timerContainerDOM.querySelectorAll (".timer");
	
	//rebuild the activeIntervals by declaring a new array.
	let newArray = [];
	
	//iterate through each dom element and get that timer's object.
	newArrangement.forEach (domElement => {
		//search the original activeIntervals array for the current dom element being iterated through.
		let targetTimer = activeIntervals.filter ( timer => {
			return domElement.id == timer.id;
		}) [0];
		
		//console.log ("the found timer: ", targetTimer);
		
		//push that element into our new array to create its new position.
		newArray.push (targetTimer);
	});
	
	//re-assign the Rank of each timer object to relfect their current position in the new array.
	for (let i = 0; i < newArray.length; i++) {
		newArray [i].rank = i;
	}
	
	//replace the old array with the new one.
	activeIntervals = newArray;
	
}


function AnimateJustDroppedElement () {
	let targetTimer = activeIntervals.filter ( timer => {
			return justDroppedId == timer.id;
	}) [0];
	
	console.log (targetTimer) 
	targetTimer.DOM.classList.add ("justDropped");
}


function DeleteTimer () {
						//footer.....//the timer
	let timerDOM = this.parentElement.parentElement
	DeleteTimerReference (timerDOM.id);
	timerDOM.remove ();
	//console.log (timerDOM.id);
	
	UpdateIntervalArray ();
}

function DeleteTimerReference (timerID) {
	//console.log ("The array before: ", activeIntervals);
	
	//create a new array with every timer except the one we wish to exclude.
	let newTimerArray = activeIntervals.filter ((currentTimer) => {
		//if the current timer being compared in the old array has an id that != the timer we wish to delete, then add it to the new array.
		return currentTimer.id != timerID;
	})
	
	//rebuild the ranks for the timers.
	for (let i = 0; i < newTimerArray.length; i++) {

		//console.log ("Timer before...: ", newTimerArray [i]);
		newTimerArray [i].rank = i;
		//console.log ("Timer after...: ", newTimerArray [i]);
	}
	
	//replace the old array with the new array.
	activeIntervals = newTimerArray;

	//console.log ("The array after: ", activeIntervals);
	
	ResetClock ();
}

//Shorthand form to create a dom element;
function Spawn (tag) {
	return document.createElement (tag)
}

//to be called by an intervalTimer when it qualifies to do so.
function PlayAlarm (audioSource) {
	intervalAlarmPlayerDOM.src = audioSource;
	intervalAlarmPlayerDOM.load ();
	intervalAlarmPlayerDOM.play ();
}

//create an innerHTML value using the data of a timer. 
function RenderTime (timerData) {
	//console.log ("timerData: ", timerData);
	let minutesText, secondsText;
	
	//format the minutes and seconds places to be "00"
	minutesText = timerData.minutes.toString ();
	if (timerData.minutes < 10) {
		minutesText = "0" + minutesText;
	}
	secondsText = timerData.seconds.toString ();
	if (timerData.seconds < 10) {
		secondsText = "0" + secondsText;
	}
	
	//create a clock format of 00 : 00 / 00 : 00 using the timer data && master clock time. 
	let totalTime = minutesText + " : " + secondsText.toString ();
	
	//create the current time. This will require checking the current elapsed time and referencing it to all the previous interval's total time.
	let currentTime = CalculateCurrentIntervalTime (timerData);
	
	//compile both results and return it.
	let finalTime = currentTime + " / " + totalTime;
	return finalTime;
}


function CalculateCurrentIntervalTime (timer) {
	let timeChunk = 0,  maxTimeChunk, totalIntervalTime = 0, numberOfLoops;
	
	//calculate where the interval timer is in relation to the master clock's time.
	for (let i = 0; i < activeIntervals.length; i++) {
		if (i < timer.rank) {
			timeChunk += activeIntervals [i].totalSeconds;
		}
		
		totalIntervalTime += activeIntervals [i].totalSeconds;
	}
	
	//need to calculate how man times the master clock has "looped through" the intervals. 
	numberOfLoops = Math.floor (seconds / totalIntervalTime);
	//console.log ("number of loops:", numberOfLoops, "Total Interval Time: ", totalIntervalTime);
	
	//here, we create a maximum for our range of interval time (timeChunk to maxTimeChunk). 
	//console.log (timeChunk, timer.totalSeconds);
	maxTimeChunk = timer.totalSeconds;

	//calculate the amount of time passed from the master clock's seconds and minutes.
	let totalElapsedSeconds = seconds + (minutes * 60);
	
	//Is the total amount of time elapsed within the range we need?
	let currentLoopMaxElapsedTime = totalIntervalTime * numberOfLoops;
	
	//relevant is the amount of time elapsed in this loop. 
	let relevantTime = totalElapsedSeconds - currentLoopMaxElapsedTime;
	
	//console.log ("current time: ", currentTimeSegment , " / ", totalIntervalTime) 

	let currentTimeSegment = relevantTime - timeChunk;
	//console.log ("currentTimeSegment: " , currentTimeSegment, "Max Chunk: ", maxTimeChunk);


	let thisTimerIsRunning = true;
	//If this timer should not even be running yet.
	if (currentTimeSegment < 0) {
		currentTimeSegment = 0;
		thisTimerIsRunning = false;
	//or, if the timer has been maxxed out.
	} else if (currentTimeSegment >= maxTimeChunk) {
		currentTimeSegment = timer.totalSeconds;
		thisTimerIsRunning = false;
	}
	
	timer.isActive = thisTimerIsRunning;
	
	if (currentTimeSegment == maxTimeChunk - 1) {
		let decisecondsText = deciseconds.toString ();
		
		let decisecondsTensPlace = decisecondsText.slice (-2);
		decisecondsTensPlace = Number (decisecondsTensPlace);
		
		//console.log (decisecondsTensPlace);
		
		if (decisecondsTensPlace > 90) {
			//console.log ("playing sound...", currentTimeSegment, " / " , maxTimeChunk);	
			PlayAlarm (timer.audioSource);
		}
	}

	
	
	
	//figure out how many minutes to display from the elapsed interval.
	let minutesPlace, secondsPlace;
	if (currentTimeSegment > 60) {
		minutesPlace = Math.floor (currentTimeSegment / 60);
		secondsPlace = currentTimeSegment - (minutesPlace * 60);
	} else {
		minutesPlace = 0;
		secondsPlace = currentTimeSegment;
	}
	
	//format any values less than 10 to display as 00 instead of 0.
	if (minutesPlace < 10) {
		minutesPlace = "0" + minutesPlace.toString ();
	} else {
		minutesPlace = minutesPlace.toString ();
	}
	if (secondsPlace < 10) {
		secondsPlace = "0" + secondsPlace.toString ();
	} else {
		secondsPlace = secondsPlace.toString ();
	}
	
	//return the final product
	currentTimeSegment = minutesPlace + ":" + secondsPlace;
	return currentTimeSegment;
}
