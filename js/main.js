var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

var collecting = false;

window.onload = function() {

	getMedia({audio: true});

    // grab our canvas
	canvasContext = document.getElementById( "meter" ).getContext("2d");
	
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }

}


function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}

function drawLoop( time ) {
    // clear the background
    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

    // check if we're currently clipping
    if (meter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "#B3FF00";

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);
    console.log(meter.volume*WIDTH*1.4);
    if (collecting && meter.volume*WIDTH*1.4 > 70){
    	$("#boost-val").text("" + (parseInt($("#boost-val").text(), 10) + (meter.volume*WIDTH / 250)).toFixed());
    }

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}


async function getMedia(constraints) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    /* use the stream */
  } catch(err) {
    /* handle the error */
  }
}


$("#hype-boost-button").click(function(){
	audioContext.resume().then(() => {
    	StartCollectHype();
  	});
});

$('#hype-modal').on('hidden.bs.modal', function () {
    StopCollectHype();
});


function StartCollectHype(){
	$("#boost-val").text("0");
	collecting = true;
}

function StopCollectHype(){
	collecting = false;
	$("#hype-count").text("" + (parseInt($("#hype-count").text(), 10) + parseInt($("#boost-val").text(), 10)));
	
}

