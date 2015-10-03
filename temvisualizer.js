/*
  Read my blog post about Web Audio API:
  http://codepen.io/DonKarlssonSan/blog/fun-with-web-audio-api
*/
(function() {

  var AudioContext;
  var audio;
  var audioContext;
  var source;
  var analyser;
  var dataArray;
  var analyserMethod = "getByteTimeDomainData";
  var streamUrl;
  var isIdle = true;

  audioEngine = {}

  audioEngine.currentTrack = 0;

  audioEngine.tracks = [];

  audioEngine.tracks.push({ title: "La llamada del destino", url: "https://soundcloud.com/todo-es-mentira/orquesta-del-nuevo-orden-mundial-popular-la-llamada-del-destino" })
  audioEngine.tracks.push({ title: "Origen del dato", url: "https://soundcloud.com/todo-es-mentira/orquesta-del-nuevo-orden-mundial-popular-origen-del-dato" })
  audioEngine.tracks.push({ title: "La morte del sogni", url: "https://soundcloud.com/todo-es-mentira/orquesta-del-nuevo-orden-mundial-popular-la-morte-dei-sogni" })

  audioEngine.initAudio = function(streamUrl) {

    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    if (!audio) {
      audio = new Audio();
      audio.crossOrigin = "anonymous";
    } else {
      audio.pause();
      audio = new Audio();
      audio.crossOrigin = "anonymous";
    }
      
    source = audioContext.createMediaElementSource(audio);
    source.connect(audioContext.destination);
    
    analyser = audioContext.createAnalyser();            
    
    source.connect(analyser);
    
    audio.src = streamUrl;

    audio.addEventListener('canplay', function() {

      if (!temv.ready) {
        temv.ready = true;
        window.setTimeout(function() {
          $("#keys-help").fadeOut(10000);
        }, 10000);
        
        $("#bigTitle").hide();
        $("#mainLoader").fadeOut(500, function() {
          $("#mainLoader").remove();
        });
        $("#bigTitle").html(audioEngine.tracks[audioEngine.currentTrack].title).fadeIn(4000, function() {
          titleTimeout = window.setTimeout(function() {
            $("#bigTitle").fadeOut(7000);
          }, 7000);
        });
        tween.start();
      }

      audio.play();

      $("#next-track .sk-three-bounce").hide();
      $("#next-track img").show();

      audioEngine.startDrawing();

    });
  };

  audioEngine.startDrawing = function() {
    // Stop drawing idle animation
    LOG_COUNT = 0;
    isIdle = false;
    analyser.fftSize = RESOLUTION * 2;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    audioEngine.drawAgain = function() {

      analyser[analyserMethod](dataArray);
      for(var i = 0; i < bufferLength; i++){
       
        if (temv) {

          var half = RESOLUTION / 2;
          var yOffset = 28.7;

          for (var j = 0; j < half; j++) {

            var height = dataArray[i] / 16;
            
            var newY = Math.max(TILE_SIZE, (height - j) * TILE_SIZE);

            temv.mosaicTiles[half + j][i].position.y = newY - yOffset;
            temv.mosaicTiles[half - j - 1][i].position.y = newY - yOffset;

          }

        }

      }

    }


  }

  audioEngine.findTrack = function() {
    var clientParameter = "client_id=31d448643c73c706796fa5609250b0ee"
    var trackPermalinkUrl = audioEngine.tracks[audioEngine.currentTrack].url;

    audioEngine.get("http://api.soundcloud.com/resolve.json?url=" +  trackPermalinkUrl + "&" + clientParameter, function (response) {
      var trackInfo = JSON.parse(response);
      streamUrl = trackInfo.stream_url + "?" + clientParameter;

      $("#bigTitle").fadeOut(500, function() {
        $("#bigTitle").html(audioEngine.tracks[audioEngine.currentTrack].title).fadeIn(7000, function() {
          titleTimeout = window.setTimeout(function() {
            $("#bigTitle").fadeOut(7000);
          }, 7000);
        });
      });

      audioEngine.initAudio(streamUrl);
    });
  };

  audioEngine.get = function(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() { 
      if (request.readyState === 4 && request.status === 200) {
        callback(request.responseText);
      }
    }

    request.open("GET", url, true);            
    request.send(null);
  }

  $("#next-track").on("click", function(e) {
    $(this).find("img").hide();
    $(this).find(".sk-three-bounce").show();
    e.preventDefault();
    audioEngine.currentTrack++;
    if (audioEngine.currentTrack > 2) audioEngine.currentTrack = 0;
    audioEngine.findTrack();
  });

  //audioEngine.initAudio();
  analyserMethod = "getByteFrequencyData";
  audioEngine.findTrack();

})();
