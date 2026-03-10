let totalTime = 1500; 
let timeLeft = 1500;
let timerInterval;

function updateDisplay(){

let minutes = Math.floor(timeLeft / 60);
let seconds = timeLeft % 60;

if(seconds < 10){
seconds = "0" + seconds;
}

document.getElementById("timer").innerText =
minutes + ":" + seconds;

let progress =
((totalTime - timeLeft) / totalTime) * 100;

document.getElementById("progress-bar").style.width =
progress + "%";
}

function startTimer(){

clearInterval(timerInterval);

timerInterval = setInterval(function(){

timeLeft--;

updateDisplay();

if(timeLeft <= 0){

clearInterval(timerInterval);

alert("Pomodoro session finished!");

}

},1000);

}

function pauseTimer(){
clearInterval(timerInterval);
}

function resetTimer(){

clearInterval(timerInterval);

timeLeft = 1500;

updateDisplay();
}

updateDisplay();
