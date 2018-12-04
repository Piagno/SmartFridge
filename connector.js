// This script represents the API between the webapp and the fridge itself
const fridgeURL = 'https://smartfridge'

//Sends the request
function sendRequest(requestData, callBackFunctionNr){
	var request = new XMLHttpRequest()
	request.open("POST",fridgeURL)
	request.setRequestHeader("Content-Type","text/plain")
	request.setRequestHeader("Connection","keep-alive")
	request.timeout = 5000
	request.ontimeout = function() {negativeCallBackHandler(callBackFunctionNr, requestData, "Timed out")}
	request.addEventListener('load', function(data) {
		console.log("Retrieved... " + data)
		if (request.status >= 200 && request.status < 300) {
			positiveCallBackHandler(callBackFunctionNr, request.responseText)
		} else {
			console.warn(request.statusText, request.responseText)
			negativeCallBackHandler(callBackFunctionNr, requestData, request.responseText)
		}
	})
	request.addEventListener('error', function(data) {
		console.warn(request.statusText, request.responseText)
		negativeCallBackHandler(callBackFunctionNr, requestData, data)
	})
	request.addEventListener('abort', function(data) {
		console.warn(request.statusText, request.responseText)
		negativeCallBackHandler(callBackFunctionNr, requestData, data)
	})
	console.log("Requesting... " + requestData)
	request.send(requestData)
}

//Checks if there is a access-code for the fridge and creates the request-data
function makeRequest(requestFunction, requestValue){
	if(localStorage.getItem("authCode") === null || localStorage.getItem("authCode") == ""){
		addNewFridge()
	}else{
		var authCode = localStorage.getItem("authCode")
		var requestData = authCode + "," + requestFunction + "," + requestValue
		sendRequest(requestData, requestFunction)
	}
}

//Distributes the response to the correspondening functions
function positiveCallBackHandler(functionNumber, responseData){
	switch(functionNumber){
		case 100:
			localStorage.setItem("authCode", responseData)
			successMessage("Minibar erfolgreich hinzugefügt!")
			break;
		case 110:
			successMessage("Successfully deleted Registration of " + responseData)
			break
		case 111:
			successMessage("Successfully deleted all Registrations")
			break
		case 120:
			successMessage("Neue Geräte können für die nächsten " + responseData + " Sekunden hinzugefügt werden")
			break
		case 130:
			responseData = responseData.split(",")
			listConnectedDevices(responseData)
			break
		case 200:
			displayDoorStatus(responseData)
			break
		case 300:
			displayTemperature(responseData)
			break
		case 400:
		case 410:
			responseData = responseData.split(":")
			displayLED(responseData[0], responseData[1])
			break
		case 401:
		case 411:
			responseData = (responseData.split(",")).split(":")
			displayAllLED(responseData)
			break
		case 500:
			responseData = responseData.split(":")
			handleSensor(responseData[0],Math.round(responseData[1]))
			break
		case 501:
			responseData = responseData.split(",")
			for(i=0; i < responseData.length; i++){
				var tray = responseData[i]
				var trayData = tray.split(":")
				handleSensor(trayData[0],Math.round(trayData[1]))
			}
			break
		case 301:
			successMessage("Temperatur auf " + responseData + " Grad Celsius gesetzt.")
			displayTemperature(responseData)
			break
	}
}

//Creates an error message if the request wasn't successfull
function negativeCallBackHandler(functionNumber, requestData, responseData){
	errorMessage(functionNumber, requestData, responseData)
}

// ALL THE FUNCTIONS OF THE API
function addNewFridge(){
	var requestData = "0,100,0"
	sendRequest(requestData, 100)
}
function deleteFridge(fridgeNumber){(110, fridgeNumber)}
function deleteAllFridges(){makeRequest(111, 0)}
function allowRegisters(allowedTime){makeRequest(120, allowedTime)}
function getAllFridges(){makeRequest(130, 0)}
function getDoorStatus(){makeRequest(200, 0)}
function getTemperature(){makeRequest(300, 0)}
function getLED(trayNumber){makeRequest(400, trayNumber)}
function getAllLED(){makeRequest(401, 0)}
function getSensor(trayNumber){makeRequest(500, trayNumber)}
function getAllSensors(){makeRequest(501, 0)}
function changeTemperature(temperature){makeRequest(301, temperature)}
function changeLED(trayNumber, color){makeRequest(410, trayNumber + ":" + color)}
function changeAllLED(color){makeRequest(411, color)}