const Client = require("azure-iot-device").Client;
const Protocol = require("azure-iot-device-mqtt").Mqtt;

const dotenv = require('dotenv');
dotenv.config();
const predictFunction = require("./predict");

function onStart(request, response) {
  console.log("Try to invoke method start(" + request.payload + ")");
  sendingMessage = true;

  response.send(200, "Successully start sending message to cloud", function (
    err
  ) {
    if (err) {
      console.error(
        "[IoT hub Client] Failed sending a method response:\n" + err.message
      );
    }
  });
}

function onStop(request, response) {
  console.log("Try to invoke method stop(" + request.payload + ")");
  sendingMessage = false;

  response.send(200, "Successully stop sending message to cloud", function (
    err
  ) {
    if (err) {
      console.error(
        "[IoT hub Client] Failed sending a method response:\n" + err.message
      );
    }
  });
}

function receiveMessageCallback(msg) {
  var message = msg.getData().toString("utf-8");
  client.complete(msg, function () {
    console.log("Receive message: " + message);
  });
}

// create a client
const connectionString=process.env.CONN_STR;
const detectorID=process.env.DETECTOR_ID;

var client = Client.fromConnectionString(connectionString, Protocol);
var sendingMessage = true;

client.open(function (err) {
  if (err) {
    console.error("[IoT hub Client] Connect error: " + err.message);
    return;
  }
  console.log("open connection");
  client.onDeviceMethod("start", onStart);
  client.onDeviceMethod("stop", onStop);
  client.on("message", receiveMessageCallback);
  setInterval(sendMessage, 2000);
});

const Message = require("azure-iot-device").Message;
var messageId = 0;

async function getMessage(cb) {
  messageId++;
  key = Math.random()
  gunshot_data = await predictFunction(key/2);
  
  cb(
    JSON.stringify({
      messageId: messageId,
      deviceId: detectorID,
      ...gunshot_data
    }),
    gunshot_data.gunshot_probability > 0.5
  );
}

function sendMessage() {
  if (!sendingMessage) {
    console.log("Not sending message", sendingMessage);
    return;
  }

  getMessage(function (content, gunshotAlert) {
    var message = new Message(content);
    message.properties.add("gunshotAlert", gunshotAlert.toString());
    console.log("Sending message: " + content);

    client.sendEvent(message, function (err) {
      if (err) {
        console.error("Failed to send message to Azure IoT Hub");
      } else {
        console.log("Message sent to Azure IoT Hub");
      }
    });
  });
}
