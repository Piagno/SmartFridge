// This script displays the different pages and controlls the fridge via the API.
// This script is the main script, where most of the logic sits and comes togheter.

//Displays an message
function displayMessage(text, backgroundColor, timeToDisplay){
	var message = document.getElementById('message')
	message.innerHTML = text
	message.className = "w3-top w3-padding w3-large w3-animate-top w3-" + backgroundColor
	window.setTimeout(hideMessage, timeToDisplay * 1000)
}

//Hides the current message
function hideMessage(){
	document.getElementById('message').className = "w3-hide"
}

//Display a positive message
function successMessage(message){
	displayMessage(message, "green", 5)
}

//Display an error message
function errorMessage(functionNumber, requestData, responseData){
	var message = "ERROR! Requested Function: '" + functionNumber + "' with data: '" + requestData + "' but received '" + responseData + "'"
	console.error(message)
	displayMessage(message, "red", 10)
}

//Does the initialization and this displays the tutorial
function initializeFridge(){
	var backgroundColor = '#474747'
	document.getElementById('svgBackground1').setAttribute("fill",backgroundColor)
	document.getElementById('svgBackground2').setAttribute("fill",backgroundColor)
	document.getElementById('svgBackground3').setAttribute("fill",backgroundColor)
	document.getElementById('svgBackground4').setAttribute("fill",backgroundColor)
	if(localStorage.getItem("trayData") == null){
		localStorage.setItem("trayData", JSON.stringify({1:{weight:"",storage:""},2:{weight:"",storage:""},3:{weight:"",storage:""},4:{weight:"",storage:""}}))
	}
	displayTray(1)
	displayTray(2)
	displayTray(3)
	displayTray(4)
	loadWeightsRecurring()
	if(localStorage.getItem("alreadyVisited") == null){
		document.getElementById('tutorial').style.display = 'block'
		localStorage.setItem("alreadyVisited","true")
	}
}

//Visually display the current capacity on the SVG
function displayLevel(trayNumber, percentage) {
	var tray = document.getElementById("svgLevel" + trayNumber)
	var y = 890 - 726 / 100 * percentage
	var height = 890 - y
	if(parseInt(tray.getAttribute("y")) > y){
		var direction = "larger"
	}else{
		var direction = "smaller"
	}
	var finished = false;
	var move = function(){
		if(direction == "larger"){
			if(parseInt(tray.getAttribute("y")) > y){
				tray.setAttribute("height", String(parseInt(tray.getAttribute("height")) + 1))
				tray.setAttribute("y", String(parseInt(tray.getAttribute("y")) - 1))
			}else{
				window.clearTimeout(looper)
			}
		}
		if(direction == "smaller"){
			if(parseInt(tray.getAttribute("y")) < y){
				tray.setAttribute("height", String(parseInt(tray.getAttribute("height")) - 1))
				tray.setAttribute("y", String(parseInt(tray.getAttribute("y")) + 1))
			}else{
				window.clearTimeout(looper)
			}
		}
	}
	var looper = setInterval(function(){move()}, Math.floor(Math.random()*10))
}

//Stores the current weight of a Sensor
function handleSensor(trayNumber, weight){
	var trays = JSON.parse(localStorage.getItem("trayData"))
	var tray = trays[trayNumber]
	tray["weight"] = weight
	localStorage.setItem("trayData", JSON.stringify(trays))
	displayTray(trayNumber)
}

//Displays all know information for a tray
function displayTray(trayNumber){
	var trays = JSON.parse(localStorage.getItem("trayData"))
	var tray = trays[trayNumber]
	var weight = parseInt(tray["weight"])
	var filledBottleWeight = parseInt(tray["filledBottleWeight"])
	var capacity = parseInt(tray["capacity"])
	document.getElementById('weight'+trayNumber).innerHTML = tray["weight"]+" Gramm"
	document.getElementById("storage"+trayNumber).innerHTML = tray["storage"]
	if(( filledBottleWeight > 0) != true || weight > filledBottleWeight){
		document.getElementById('weight'+trayNumber).innerHTML = tray["weight"]+" Gramm"
		document.getElementById('setMaxWeight'+trayNumber).style.backgroundColor = "orange"
	}else{
		var currentCapacity = weight - (filledBottleWeight - capacity)
		var percentage = Math.round(currentCapacity/capacity*100)
		document.getElementById('weightPercentage'+trayNumber).innerHTML = percentage
		displayLevel(trayNumber, percentage)
	}
}

//Sets the current weight as the weight of the bottle
function setMax(trayNumber){
	var trays = JSON.parse(localStorage.getItem("trayData"))
	var tray = trays[trayNumber]
	tray["filledBottleWeight"] = tray["weight"]
	localStorage.setItem("trayData", JSON.stringify(trays))
	document.getElementById('setMaxWeight'+trayNumber).style.backgroundColor = "#0af9ff"
	setFill(trayNumber)
}

//Sets the capacity of the tray
function setFill(trayNumber) {
	var trays = JSON.parse(localStorage.getItem("trayData"))
	var tray = trays[trayNumber]
	var capacity = prompt("Füllmenge der Flasche in ml angeben")
	if(capacity != null ){
		tray["capacity"] = capacity
		localStorage.setItem("trayData", JSON.stringify(trays))
		displayTray(trayNumber)
	}	
}

//Changes the content of a tray
function changeStored(trayNumber) {
	var trays = JSON.parse(localStorage.getItem("trayData"))
	var tray = trays[trayNumber]
	var stored = prompt("Neuen Inhalt angeben")
	if(stored != null){
		tray["storage"] = stored
		localStorage.setItem("trayData", JSON.stringify(trays))
		displayTray(trayNumber)
	}
}

//Loads the current weight every 10 seconds
function loadWeightsRecurring(){
	setInterval(function(){
		getAllSensors()
	},10000)
}

//Registers the ServiceWorker for a seemles experience while offline or on a "bad connection"
if('serviceWorker' in navigator){
	navigator.serviceWorker.register('/smartfridge/service-worker.js', {
		scope: '/smartfridge/'
	});
}

//Initzializes needes things
initializeFridge()