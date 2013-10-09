(function(){
	window.addEventListener("load", function(){
		var timeInputs = document.querySelectorAll("#clock input");
		var seconds = document.querySelector("#seconds");
		var minutes = document.querySelector("#minutes");
		var clockForm = document.querySelector("#clockForm");
		
		var badMinutes = document.querySelector("#badMinutes");
		var badSeconds = document.querySelector("#badSeconds");
		var badMinutesValue, badSecondsValue;
		
		var settingsInputs = document.querySelectorAll("#settings_container input");
		var hideButton = document.querySelector("#hidebutton");
		var settingsContainer = document.querySelector("#settings_container");		
		
		var startStop = document.querySelector("#start_stop");
		var resetButton = document.querySelector("#reset");
		
		var playImage = document.querySelector("[src*='play']");
		var pauseImage = document.querySelector("[src*='pause']");
		
		var minuteValue, secondValue, savedMinutes, savedSeconds;
		
		var timerIntervalId;
		
		// This will either be "running", "paused" or "stopped".
		var timerState;
		
		
		// A flag indicating whether or not the timer is starting from the beginning
		var resetFlag = true;
		
		// Whether or not the warning state is on
		var warningFlag = false;
		
		// Behavior for the button that toggles the settings container
		hideButton.addEventListener("click", function(event){
			if(settingsContainer.className === "hidden"){
				settingsContainer.removeAttribute("class");
			} else {
				settingsContainer.className = "hidden";
			}
		});
		
		// Keeps the seconds field under 59
		function capSeconds(element){
			if(element === undefined){
				if(seconds.value >= 60){
					seconds.value = 59;
				}
			} else {
				if(element.value >= 60){
					element.value = 59;
				}
			}
		}
		
		 /* 
		 Change the background color for the timer. This color should communicate how
		 much time the speaker has. The color is changed by assigning the class name
		 of the body. If no argument is passed, the class attribute is be removed.
		 */
		function changeBackground(classname){
			if(classname === undefined){
				document.body.removeAttribute("class");
			} else {
				document.body.className = classname;
			}
		}
		
		/* 
		Clear the <html> and <body> styles 
		*/
		function clearStyles(){
			document.body.removeAttribute("style");
		}
		
		/*
		The timer's appearance when started
		*/
		function startState(){
			startStop.removeAttribute('class');
			startStop.classList.toggle("running");
		}
		
		/*
		The timer's appearance when paused
		*/		
		function pauseState(){
			startStop.removeAttribute('class');
			startStop.classList.toggle("paused");
		}
		
		/*
		The timer's appearance when stopped.
		*/
		function stopState(){
			startStop.removeAttribute('class');
			startStop.classList.toggle("stopped");
		}
		
		/*
		Add a leading zero if necessary
		*/
		function addLeadingZero(input){
			var value = input.value;
			
			// Add a leading zero if the number is one digit
			if(value.length === 1){
				input.value = "0" + value;
			// For three digit minutes, reduce them to two digits if they begin with a zero
			} else if(value.length === 3){
				if(value.charAt(0) === "0"){
					input.value = value.substr(1);
				}
			}
		}
		
		/*
		The time input element behavior when a key is pressed
		*/
		function timeOnKeypress(event){
			// Firefox only input check to prevent non-digits
			if(event.key === "MozPrintableKey" && (event.charCode < 48 || event.charCode > 57)){
				event.preventDefault();
				return false;
			}
		}
		
		/*
		The time input element behavior when its value changes
		*/
		function timeOnInput(event){
			// Don't let the user enter non-digits
			this.value = this.value.replace(/\D+/, "");
				
			// Make sure the seconds value is under 60
			if(this.id.match(/seconds/i)){
				capSeconds(this);
			}
		}
		
		/*
		The time input element behavior when focus is lost
		*/
		function timeOnBlur(event){
			// Make sure there is a leading zero if necessary
			addLeadingZero(this);
				
			// Make sure the seconds value is under 60
			if(this.id.match(/seconds/i)){
				capSeconds(this);
			}
		}
		
		// Add event listeners for the time input fields
		for(var i = 0; i < timeInputs.length; i++){
			timeInputs[i].addEventListener("keypress", timeOnKeypress);
			
			// Check the inputs after they have changed to clear non-digits
			timeInputs[i].addEventListener("input", timeOnInput);
			
			timeInputs[i].addEventListener("blur", timeOnBlur);
		}
		
		// Add event listeners for time fields in settings
		for(var i = 0; i < settingsInputs.length; i++){
			settingsInputs[i].addEventListener("keypress", timeOnKeypress);
			
			// Check the inputs after they have changed to clear non-digits
			settingsInputs[i].addEventListener("input", timeOnInput);
			
			settingsInputs[i].addEventListener("blur", timeOnBlur);
		}
		
		// Submitting #clockform will start the clock
		clockForm.addEventListener("submit", startTimer);
		
		/* 
		Subtracts one second from the clock
		*/
		function subtractSecond(){
			minuteValue = window.parseInt(minutes.value, 10);
			secondValue = window.parseInt(seconds.value, 10);
			
			// First, see if the clock has reached 0, which means time is up
			if(secondValue === 0 && minuteValue === 0){
				changeBackground("ugly");
				
				stopTimer();
				
				resetFlag = true;
				warningFlag = false;
				
				return;
			}
			
			if(!warningFlag){
				if(minuteValue <= badMinutesValue){
					if((secondValue - 1) <= badSecondsValue){
						warningFlag = true;
						changeBackground("bad");
					}
				}
			}
			
			/*
			When the seconds reach 0, reset that field to 59 and subtract one from 
			the minutes.
			*/
			if(secondValue === 0){
				seconds.value = 59;
				
				if(minuteValue !== 0){
					minutes.value = minuteValue - 1; 
				}
			} else {
				seconds.value = secondValue - 1;
			}
			
			// See if a leading zero is needed.
			addLeadingZero(minutes);
			addLeadingZero(seconds);
		}
		
		function startTimer(event){
			event.preventDefault();
			
			// If the timer is running, then pause it on form submission
			if(timerState === "running"){
				pauseTimer();
				return;
			}
			
			timerState = "running";
			
			// Make sure the warning limit values are digits			
			badMinutesValue = (badMinutes.value === "" || badMinutes.value.match(/\D+/)) ? 0 : window.parseInt(badMinutes.value, 10);
			badSecondsValue = (badSeconds.value === "" || badSeconds.value.match(/\D+/)) ? 0 : window.parseInt(badSeconds.value, 10);
			
			// Convert any empty values to zero
			for(var i = 0; i < timeInputs.length; i++){
				if(timeInputs[i].value === ""){
					timeInputs[i].value = 0;
				}
				 /* 
				 Make sure each time input has a leading zero if need be 
				 before the timer starts
				 */
				addLeadingZero(timeInputs[i]);
			}
			
			if(resetFlag){
				savedMinutes = minutes.value;
				savedSeconds = seconds.value;
				resetFlag = false;
			}
			
			
			// Make sure the inputs are valid before starting the timer
			if(!this.checkValidity()){
				return;
			}
			
			//	Clear any inline styles before starting the timer
			clearStyles();
			
			if(!warningFlag){
				changeBackground("good");
			}
			
			// Change the Start button to the started state
			startState();
			
			// Make the time inputs read only while the clock is running
			for(var i = 0; i < timeInputs.length; i++){
				timeInputs[i].setAttribute("readonly", "true");
			}
			
			//	Save the setInterval id and start the clock
			timerIntervalId = window.setInterval(subtractSecond, 1000);
		}
		
		/*
		Pause the timer
		*/
		function pauseTimer(){
			timerState = "paused";
			pauseState();
			window.clearInterval(timerIntervalId);
		}
		
		/*
		Stop the timer
		*/
		function stopTimer(){
			timerState = "stopped";
			stopState();
			window.clearInterval(timerIntervalId);
			
			// Allow the time inputs to be edited again after the clock has stopped
			for(var i = 0; i < timeInputs.length; i++){
				timeInputs[i].removeAttribute("readonly");
			}
		}
		
		/* 
		Stops the timer and resets it to the last setting 
		before the timer was started from the stopped state.
		*/
		resetButton.addEventListener("click", function(event){
			stopTimer();
			
			// Only use these values if they are defined and non-null
			if(savedMinutes && savedSeconds){
				minutes.value = savedMinutes;
				seconds.value = savedSeconds;
			}
			
			changeBackground();
			resetFlag = true;
			warningFlag = false;
		});
		
	});	
})();