///////////////////////////////////////////////////////
//
// File: confo.js
// This is the main conference application file for client end point. It tries to use Enablex Web Toolkit to
// communicate with EnableX Servers
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/////////////////////////////////////////////////////

var localStream = null;
var username = null;
var myClientId = null;
var room;
var awaitingParticipants;
var SUPPORT_URL = "https://saas-portal-loknath.vcloudx.com/video_call/client/";
// Player Options
var options = {
  id: "vcx_1001",
  attachMode: "",
  player: {
    autoplay: "",
    name: "",
    nameDisplayMode: "",
    frameFitMode: "bestFit",
    skin: "classic",
    class: "",
    height: "inherit",
    width: "inherit",
    minHeight: "120px",
    minWidth: "160px",
    aspectRatio: "",
    volume: 0,
    media: "",
    loader: {
      show: false,
      url: "img/loader.gif",
      style: "default",
      class: "",
    },
    backgroundImg: "img/player-bg.gif",
  },
  toolbar: {
    displayMode: "auto",
    autoDisplayTimeout: 0,
    position: "top",
    skin: "default",
    iconset: "default",
    class: "",
    buttons: {
      play: false,
      share: false,
      mic: false,
      resize: false,
      volume: false,
      mute: false,
      record: false,
      playtime: false,
      zoom: false,
    },
    branding: {
      display: false,
      clickthru: "https://www.enablex.io",
      target: "new",
      logo: "img/enablex.png",
      title: "EnableX",
      position: "right",
    },
  },
};

var ATList = [];
var countStream = 0;

  var localStreamId = null;

  var setLiveStream = function (stream, remote_name, client_id) {
    if (stream.ifScreen()) {
      options.player.height = "inherit";
      options.player.width = "inherit";
      options.player.loader.class = "";
      options.player.loader.show = false;
      var nameDiv = document.createElement("div");
      nameDiv.setAttribute("class", "name-div");
      nameDiv.innerHTML = remote_name;
      document.getElementById("screen_video_div").appendChild(nameDiv);
      stream.play("screen_video_div", options);
      document.getElementById("screen_video_div").style.display = "block";
    } else {
      // Listening to Text Data
      stream.addEventListener("stream-data", function (e) {
        var text = e.msg.textMessage;
        var html = $(".multi_text_container_div").html();
        $("#multi_text_container_div").html(html + text + "<br>");
      });
      var name =
        stream.getAttributes().name !== undefined
          ? stream.getAttributes().name
          : "";
      if (!stream.local) {
        var newStreamDiv = document.createElement("div");
        newStreamDiv.setAttribute("id", "liveStream_" + client_id);
        newStreamDiv.setAttribute("class", "live_stream_div col-md-3 col-sm-3");
        var nameDiv = document.createElement("div");
        nameDiv.setAttribute("class", "name-div");
        nameDiv.innerHTML = remote_name + "<i id='mike_" + client_id + "'></i>";
        newStreamDiv.appendChild(nameDiv);
        var multi_video_div = document.getElementById(
          "multi_video_container_div"
        );
        multi_video_div.appendChild(newStreamDiv);
        options.player.height = "inherit";
        options.player.width = "inherit";
        options.player.class = "test_class";

        stream.play("liveStream_" + client_id, options);
        countStream++;
      } else {
        options.player.height = "inherit";
        options.player.width = "inherit";
        options.player.loader.class = "";
        options.player.loader.show = false;
        var controlsDiv = document.getElementById("controls-div");
        controlsDiv.style.display = "block";
        var nameDiv = document.createElement("div");
        nameDiv.setAttribute("class", "name-div");
        nameDiv.innerHTML = name;
        // document.getElementById("local_video_div").appendChild(controlsDiv);
        document.getElementById("local_video_div").appendChild(nameDiv);
        stream.play("local_video_div", options);
      }
    }
  };
window.onload = function () {
  // URL Parsing to fetch Room Information to join
  var parseURLParams = function (url) {
    var queryStart = url.indexOf("?") + 1,
      queryEnd = url.indexOf("#") + 1 || url.length + 1,
      query = url.slice(queryStart, queryEnd - 1),
      pairs = query.replace(/\+/g, " ").split("&"),
      parms = {},
      i,
      n,
      v,
      nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
      nv = pairs[i].split("=", 2);
      n = decodeURIComponent(nv[0]);
      v = decodeURIComponent(nv[1]);

      if (!parms.hasOwnProperty(n)) parms[n] = [];
      parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
  };
  var urlData = parseURLParams(window.location.href);
  var name = urlData.user_ref[0];

  // Local Stream Definition
  var config = {
    audio: true,
    video: true,
    data: true,
    videoSize: [640, 480, 640, 480],
    options: options,
    attributes: {
      name: name,
    },
  };

  

  // Function: To create user-json for Token Request

  var createDataJson = function (url) {
    var urlData = parseURLParams(url);
    username = urlData.user_ref[0];
    var retData = {
      name: urlData.user_ref[0],
      role: urlData.usertype[0],
      roomId: urlData.roomId[0],
      user_ref: urlData.user_ref[0],
    };
    return retData;
  };

  // Function: Create Token

  createToken(createDataJson(window.location.href), function (response) {
    var token = response;


    // var room = EnxRtc.EnxRoom({token});
    // room.connect({allow_reconnect : true, number_of_attempts : 10, timeout_interval : 10000});
    // room.addEventListener("room-connected", function (event) {
    //   // Connected. event receives Room Meta JSON
    //   console.log("Room onnected event....", event);
    //   let streams = event.streams;
    //   for (var i = 0; i < streams.length; i++) {
    //     room.subscribe(streams[i]);
    //   }
    //   let streamOpt = {
    //       audio: true, 
    //       video: true, 
    //       data: true, 
    //       options: options,
    //       attributes: { name: urlData.user_ref[0]}
    //   };
    //   let publishOpt = {};
  
    //   localStream = EnxRtc.EnxStream( streamOpt );
    //   console.log('localStream', localStream);

    //   room.publish(localStream, publishOpt, function(StreamId) {
    //       console.log('Stream Published.....', localStream);
    //       setLiveStream(localStream);
    //   });
    //   $(".tools").show();
    //   if (urlData.usertype[0] == "moderator") {
    //     $("#moderatorOptions").show();
    //   }
    //   myClientId = room.clientId;
    //   addAllEvenListners(room);
    //   refreshAwaitingList(room);
    // });
    // return false;

    // JOin Room 
    localStream = EnxRtc.joinRoom(token, config, function (success, error) {
      if (error && error != null) {
      }
      if (success && success != null) {
        // $(".tools").show(); 
        room = success.room;
        var ownId = success.publishId;
        myClientId = room.clientId;
        let roomSettings = room.roomSettings;
        let myDetails = room.me;
        if(room.waitRoom){          
          let infoText = 'Wait for moderator to join...!';
          if(roomSettings.knock == true){
            infoText = 'Wait moderator to allow you...!';
          }
          document.getElementById('info_container').innerHTML = infoText;
          document.getElementById('info_container').style.display = 'block';
        }else{
          document.getElementById('info_container').style.display = 'none';
          if (myDetails.role == "moderator") {
            $("#moderatorOptions").show();
          }

          if(myDetails.role == "moderator"){
            setLiveStream(localStream);
            document.querySelectorAll('.publisher-control').forEach(function(ele){
              ele.style.display = 'block';
            });  
            document.getElementById('floor-request').style.display = 'none';         
          }else{
            document.querySelectorAll('.publisher-control').forEach(function(ele){
              ele.style.display = 'none';
            });
            document.getElementById('floor-request').style.display = 'block';
          }

          var controlsDiv = document.getElementById("controls-div");
          controlsDiv.style.display = "block";

          console.log("ROOM ........", room);
          console.log("Success STREAMS.....", success.streams);
          for (var i = 0; i < success.streams.length; i++) {
            room.subscribe(success.streams[i]);
          }
        }
        addAllEvenListners(room);
        refreshAwaitingList(room);
      }
    });
  });
};

//ROOM EVENT LISTNERS***************************************************************
function addAllEvenListners(room){
  room.addEventListener("room-connected", function (event) {
    // Connected. event receives Room Meta JSON
    console.log("Conncted into room...");
  });

  room.addEventListener("user-connected", function (event, user) {
    // A new user connected. user JSON has user information
    console.log("new user conncted...", event, user);
    // alert('new user conncted...');
  });

  // Active Talker list is updated
  room.addEventListener("active-talkers-updated", function (event) {
    console.log("Active Talker List :- ", event.message.activeList);
    // alert('Active talker updated ..... ');
    ATList = event.message.activeList;
    document
      .querySelectorAll(".classic_vcx_stream")
      .forEach(function (item) {
        item.classList.remove("border-b-active");
      });
    var video_player_len = document.querySelector(
      "#multi_video_container_div"
    ).childNodes;

    if (
      event.message &&
      event.message !== null &&
      event.message.activeList &&
      event.message.activeList !== null
    ) {
      // alert('have active talker...');
      if (ATList.length == video_player_len.length) {
        return;
      } else {
        document.querySelector("#multi_video_container_div").innerHTML = "";
        $("#allPrticipants").html("");
        for (stream in room.remoteStreams.getAll()) {
          var st = room.remoteStreams.getAll()[stream];
          for (j = 0; j < ATList.length; j++) {
            var remote_name = ATList[j].name;
            var client_id = ATList[j].clientId;
            if (ATList[j].streamId == st.getID()) {
              setLiveStream(st, remote_name, client_id);

              // $("#allPrticipants").append(
              //   "<div class='participant_each col-lg-6' >" +
              //     remote_name +
              //     "<br><input type='checkbox' class='mute_user_audio' data-client-id='" +
              //     client_id +
              //     "'>Mute Audio<input type='checkbox' class='mute_user_video' data-client-id='" +
              //     client_id +
              //     "'>Mute Video <input type='checkbox' class='make_moderator' data-client-id='" +
              //     client_id +
              //     "'>Moderator <i class='fa fa-trash disconnect_user' data-client-id='" +
              //     client_id +
              //     "'></i><hr></div>"
              // );
              addParticipantToList(remote_name, client_id);
            }
          }
        }
      }
    }else{
      // alert('No active talker...');
      document.querySelector("#multi_video_container_div").innerHTML = "";
      $("#allPrticipants").html("");
    }

    if (ATList !== null && ATList.length) {
      var active_talker_stream = ATList[0].streamId;

      document
        .getElementById("stream" + active_talker_stream)
        .classList.add("border-b-active");
    }
  });

  // Stream has been subscribed successfully
  room.addEventListener("stream-subscribed", function (streamEvent) {
    // alert('New User connected...'); //It is being triggered 6 times on a user connection (self connection)
    //   console.warn(streamEvent);
    var stream =
      streamEvent.data && streamEvent.data.stream
        ? streamEvent.data.stream
        : streamEvent.stream;
    for (k = 0; k < ATList.length; k++) {
      if (ATList[k].streamId == stream.getID()) {
        var remote_name = ATList[k].name;
        var client_id = ATList[k].clientId;
        setLiveStream(stream, remote_name, client_id);
      }
    }
  });

  // Listening to Incoming Data
  // room.addEventListener("active-talker-data-in", function (data) {
  //   console.log("active-talker-data-in" + data);
  //   var obj = {
  //     msg: data.message.message,
  //     timestamp: data.message.timestamp,
  //     username: data.message.from,
  //   };
  //   plotChat(obj);
  // });

  // Stream went out of Room
  room.addEventListener("stream-removed", function (event) {
    // alert('One user deisconnected...'); //It is being triggered 6 times on a user disconnection
    // console.log("stream removed", event);
    // alert('one stream removed')
  });

  //handle if knock is enabled for room and moderator allows a participant
  room.addEventListener("room-allowed", function (event) {
    // alert("Moderator permitted you into room...");

    if (event.message.streams) {
      for (var i = 0; i < event.message.streams.length; i++) {
        room.subscribe(event.message.streams[i]);
      }
    }
  });

  //handle awaiting user if knock is enabled for room
  room.addEventListener("user-awaited", function (event, user) {
    console.log(
      "Awaiting Users events   ",
      event,
      user,
      room.awaitedParticipants
    );
    // alert("Users awaiting to allow into room...");
    refreshAwaitingList(room);
  });

  //handle user disconnectionn at disconnecting user side
  room.addEventListener("room-disconnected", function (event) {
    console.log("disconnedct Event...", event);
    let disconnectCause = event.message.cause;
    if (disconnectCause.cause == 2001) {
      // alert("Moderator disconnected you...!");
    }
    window.location.href = SUPPORT_URL;
  });

  //handle remote user disconnection on other user side
  room.addEventListener("user-disconnected", function (event) {
    console.log("Remote user disconnected event...", event);
    // alert("disconnected client_id " + event.clientId);
    // $("#liveStream_" + event.clientId).remove();
  });

  // Notification to all when share starts
  room.addEventListener("share-started", function (event) {
    // Get Stream# 101 which carries Screen Share
    console.log("Share Screeen Event... ", event);
    let msg = event.message;
    console.log(msg.clientId, " != ", myClientId);
    var shared_stream = room.remoteStreams.get(101);
    if (msg.clientId != myClientId) {
      setLiveStream(shared_stream, "Scrren Shared", 101);
      $(".share-screen").hide();
    }
  });

  // Notification to all when share stops
  room.addEventListener("share-stopped", function (event) {
    // Handle UI here
    //$('#screen_video_div').remove();
    document.getElementById("screen_video_div").style.display = "none";
    $(".share-screen").show();
  });

  // Notification to others when a user muted audio
  room.addEventListener("user-audio-muted", function (event) {
    // Handle UI here
    $("#mike_" + event.clientId).addClass("fa fa-microphone-slash");
  });

  // Notification to others when a user muted audio
  room.addEventListener("user-audio-unmuted", function (event) {
    // Handle UI here
    $("#mike_" + event.clientId).removeClass("fa fa-microphone-slash");
  });

  // To receive message notification
  room.addEventListener("message-received", function (event) {
    console.log("new message", event);
    var InMsg = event.message;
    if (InMsg.broadcast === true) {
      // Handle Public Message
    } else {
      // Handle Message from InMsg.sender
    }

    $("#messages").append(
      "<div><b>" + InMsg.sender + " : </b>" + InMsg.message + "</div>"
    );
    if (!isChatboatOpen) {
      document
        .getElementById("chat_icon")
        .setAttribute("class", "fa fa-comments");
    }
  });

  //handle file upload done by user
  room.addEventListener("fs-upload-result", function (event) {
    var msg = event.message;
    let upJobId;
    switch (msg.messageType) {
      case "upload-started":
        // Note msg.upJobId for management
        // upload-started event JSON Example given below
        console.log("dfsf sdf sdf dsfds f", msg);
        let uploadDetails = msg.response.uploadInfo;
        let fileName = uploadDetails.name;
        upJobId = uploadDetails.upJobId;
        console.log("uploadDetails    ", uploadDetails);       

        let newFileThread = document.createElement('div');
        let userName = document.createElement('b');
        userName.textContent = 'Me: ';
        newFileThread.appendChild(userName);
        let fileIcon = document.createElement('i');
        fileIcon.setAttribute('class', 'fa fa-file');
        fileIcon.setAttribute('title', fileName);
        
        newFileThread.appendChild(fileIcon);
        let cancelIcon = document.createElement('i');
        cancelIcon.setAttribute('class', 'fa fa-close');
        cancelIcon.setAttribute('title', fileName);
        cancelIcon.setAttribute('id', "up_cancel_" + upJobId);
        cancelIcon.addEventListener('click', function(){
          cancelFileUpload(upJobId);
        });
        newFileThread.appendChild(cancelIcon);
        document.getElementById("messages").appendChild(newFileThread);

        // alert('upload started');
        break;
      case "upload-completed":
        // Know msg.upJobId is completed
        // upload-completed event JSON Example given belowbreak;
        // alert('upload completed');
        console.log("UPLOAD DONEEEEEE", msg);
        upJobId = msg.response.upJobId;
        $("#up_cancel_" + upJobId).remove();
        break;
      case "upload-failed":
        // Know msg.upJobId has failed
        // upload-failed event JSON Example given belowbreak;
        alert("upload failed");
        break;
      default:
        break;
    }
  });

  //Listner for a file uploaded by a user and downloaded by another user
  room.addEventListener("fs-download-result", function (event) {
    let allFiles = room.availableFiles;
    console.log("FILE DATA", event);
    console.log("FILE COUNTS", allFiles.length);
    var msg = event.message;
    switch (msg.messageType) {
      case "download-available":
        // Look for JSON Object for file infomration
        let downloadInfo = msg.response.downloadInfo;
        let sender = downloadInfo.sender;
        let fileName = downloadInfo.name;
        let jobIndex = downloadInfo.index;

        //   alert("download availableeeee.....");
        let newFileThread = document.createElement('div');
        let userName = document.createElement('b');
        userName.textContent = sender;
        newFileThread.appendChild(userName);
        let fileIcon = document.createElement('i');
        fileIcon.setAttribute('class', 'fa fa-file');
        fileIcon.setAttribute('title', fileName);
        newFileThread.appendChild(fileIcon);
        let dwnldIcon = document.createElement('i');
        dwnldIcon.setAttribute('class', 'fa fa-download');
        dwnldIcon.setAttribute('title', fileName);
        dwnldIcon.addEventListener('click', function(){
          downloadFile(jobIndex);
        });
        newFileThread.appendChild(dwnldIcon);
        document.getElementById("messages").appendChild(newFileThread);        

        if (!isChatboatOpen) {
          document
            .getElementById("chat_icon")
            .setAttribute("class", "fa fa-comments");
        }
        break;
      case "download-started":
        // Note msg.jobId for cancellation
        // download-started event JSON Example given below
        console.log("download started.....", msg);
        alert("download started.....", msg);
        break;
      case "download-completed":
        // Know msg.jobId is completed
        // download-completed event JSON Example given belowbreak;
        alert("download completed.....");
        break;
      case "download-failed":
        // Know msg.jobId has failed
        // download-failed event JSON Example given belowbreak;
        alert("download failed.....");
        break;
      default:
        break;
    }
  });

  //Listner for hard mute room done by moderator
  room.addEventListener("hard-mute-room", function () {
    // alert('Moderator muted the room.....');
    muteMic();
  });

  //Listner for hard unmute room done by moderator
  room.addEventListener("hard-unmute-room", function () {
    // alert('Moderator unmuted the room.....');
    unmuteMic();
  });

  //Listner for hard mute participant done by moderator
  room.addEventListener("hardmute-user-audio", function () {
    // alert('Moderator muted the room.....');
    muteMic();
  });

  //Listner for hard unmute participant done by moderator
  room.addEventListener("hardunmute-user-audio", function () {
    // alert('Moderator unmuted the room.....');
    unmuteMic();
  });

  //Listner for user role changed
  room.addEventListener("user-role-changed", function (event) {
    console.log("role data ..... ", event);
    // alert('handle role changed ');
    let eventData = event.message;
    let modControlVisibility = 'none';
    if (myClientId == eventData.moderator.new) {
      modControlVisibility = 'block';
    }
    // alert(modControlVisibility);
    document.getElementById("moderatorOptions").style.display = modControlVisibility;
    document.querySelectorAll('.host_controls').forEach(function(controls){
      controls.style.display = modControlVisibility;
    });
    
  });

  //Listner for recording on
  room.addEventListener("room-record-on", function (event) {
    // Recording started, Update UI
    // event.message.moderatorId = Moderator who stated recording.
    alert("recording started....");
  });

  // Notification recording stopped to all
  room.addEventListener("room-record-off", function (event) {
    // Recording stopped, Update UI
    // event.message.moderatorId = Moderator who stopped recording.
    alert("recording stopped....");
  });

  // Moderator receives Floor Access Request
  room.addEventListener("floor-requested", function (evt) {             
    /*  evt.users.clientId, evt.users.name */
    console.log('Request Event....', evt);
    if(room.me.role == 'moderator'){

      let requesting_user = document.createElement("div");
      requesting_user.setAttribute("class", "requesting_user");
      requesting_user.innerHTML = evt.users.name;

      let allow_icon = document.createElement("i");
      allow_icon.setAttribute("class", "fa fa-check");
      allow_icon.setAttribute("data-id", evt.users.clientId);
      requesting_user.appendChild(allow_icon);

      let deny_icon = document.createElement("i");
      deny_icon.setAttribute("class", "fa fa-close");
      deny_icon.setAttribute("data-id", evt.users.clientId);
      requesting_user.appendChild(deny_icon);

      requesting_user.setAttribute("id", "requesting_"+evt.users.clientId);
      document.getElementById("request_list").appendChild(requesting_user);

      allow_icon.addEventListener("click", function (e) {
        console.log("E    ", e);
        room.grantFloor(evt.users.clientId, function (approveStatus) {
          console.log("approve Status....    ", approveStatus);
          if(approveStatus.result == 0){            
            document.getElementById("requesting_"+evt.users.clientId).remove();

            let releaseButton = document.createElement('button');
            releaseButton.setAttribute('class', 'btn btn-danger');
            releaseButton.appendChild(document.createTextNode('Release Floor'));
            releaseButton.setAttribute('id', 'releaseFloor');
            releaseButton.addEventListener('click', function(){
              room.relaseFloor(evt.users.clientId, releaseFunction);
            });
            document.getElementById('mod_buttons').appendChild(releaseButton);


            // refreshAwaitingList(room);
          }else{
            alert(approveStatus.msg);
          }
        });
      });

      deny_icon.addEventListener("click", function (e) {
        console.log("E    ", e);
        room.denyFloor(evt.users.clientId, function (approveStatus) {
          console.log("deny Status.....    ", approveStatus);
          document.getElementById("requesting_"+evt.users.clientId).remove();
          // refreshAwaitingList(room);
        });
      });

    }else{
      document.getElementById('floor-request').style.display = 'none';
    }
  }); 


  // Moderators and the Participant is notified about granted Floor Access 
  room.addEventListener("floor-granted", function (evt) {
    room.publish(localStream); // Publish stream 
    setLiveStream(localStream);
    document.querySelectorAll('.publisher-control').forEach(function(ele){
      ele.style.display = 'block';
    });  
    document.getElementById('floor-request').style.display = 'none'; 
    document.getElementById('cancel-floor-request').style.display = 'none'; 
    document.getElementById('finish-floor').style.display = 'block'; 
    // evt.msg.moderatorId = Moderator who granted Floor Access


  });

  // Affected Participant and Moderator(s) are notified about denied request
  room.addEventListener("floor-denied", function (evt) {
    // evt.msg.moderatorId = The modeator who denied
    // evt.msg.clientId = The Participan who is denied     
    document.getElementById('cancel-floor-request').style.display = 'none'; 
    document.getElementById('floor-request').style.display = 'block';
    // alert('Floor request denied....');
  }); 

  // Moderator receives Floor Cancellattion Notification
  room.addEventListener("floor-cancelled", function (evt) {             
    // evt.msg.clientId = The participant who cancelled
    console.log('FLOOR CANCEL EVENT....', evt);
    document.getElementById("requesting_"+evt.users.clientId).remove();
  });

  // Notificatation that floor access is released
  room.addEventListener("release-floor", function (evt) {
    // evt.msg.moderatorId = The moderator who released floor access
    // evt.msg.clientId = The Participant whose floor access is released
    hideFloorControls();
  });

}
//EVENT LISTNERS***************************************************************************

$(function () {
  $(document).on("click", ".fa-download", function () {
    let jobId = $(this).attr("id");
    $(this)
      .parent()
      .append(
        '<i id="cancel_' +
          jobId +
          '" onclick="cancelDownloadFile(' +
          jobId +
          ')" class="fa fa-trash"></i>'
      );
    // alert('download clicked.....'+jobId);
  });
});
var onImgPath = "img/mike.png",
  onImgName = "mike.png";
var offImgPath = "img/mute-mike.png",
  offImgName = "mute-mike.png";
var elem = document.getElementsByClassName("icon-confo-mute")[0];
var muted = false;
function audioMute() {
  muted = !muted;
  var currentImgPath = elem.src.split("/")[elem.src.split("/").length - 1];
  // if(currentImgPath === offImgName){
  //     muteAudio();
  // }
  // else if(currentImgPath === onImgName){
  //     unmuteAudio();
  // }
  if (muted === true) {
    localStream.muteAudio(function (arg) {
      muteMic();
    });
  } else {
    localStream.unmuteAudio(function (arg) {
      unmuteMic();
    });
  }
}
function muteMic() {
  muted = true;
  elem.src = offImgPath;
  elem.title = "unmute audio";
}
function unmuteMic() {
  muted = false;
  elem.src = onImgPath;
  elem.title = "mute audio";
}

function disconnectCall() {
  var r = confirm("Do you want to quit?");
  if (r == true) {
    console.log(room);
    room.disconnect();
    // alert('Disconnecting.....')
    window.location.href = SUPPORT_URL;
  }
}

var sharing = false;
function shareScreen() {
  // alert('share screen');
  sharing = !sharing;
  if (sharing) {
    streamShare = room.startScreenShare(function (shareResult) {
      // alert('share screen started');
      // console.log("Share Result", shareResult);
      if (shareResult.result == 0) {
        $(".share-screen").hide();
      } else {
        sharing = !sharing;
      }
    });

    streamShare.addEventListener("stream-ended", (a) => {
      room.stopScreenShare((a) => {
        console.log(a);
      });
    });
  } else {
    room.stopScreenShare((a) => {
      console.log(a);
    });
  }
}

function sendMessage() {
  let message = $("#message").val();
  room.sendMessage(message, true, [], function (data) {
    // Message sent
    $("#message").val("");
    $("#messages").append("<div><b>Me : </b>" + message + "</div>");
  });
}

function shareFile() {
  alert("File Selected");
  var clientList = [];
  var shareOptions = {
    isMobile: false,
    broadcast: true,
    clientList: clientList,
  };

  let files = document.getElementById("share_file").files;
  room.sendFiles(files, shareOptions, function (resp) {
    if (resp.result == "0") {
      // Success JSON Example given below
      document.getElementById("share_file").value = "";
    } else {
      // Error JSON Example given below
    }
  });
}

function downloadFile(jobId) {
  alert(jobId);
  let allFiles = room.availableFiles;
  console.log("allFiles  allFiles  allFiles", allFiles);
  room.recvFiles(jobId, {}, function (dwnlresps) {
    console.log("dwnlresps ============", dwnlresps);
    if (dwnlresps.result == "0") {
      // Success JSON Example given below
    } else {
      // Error JSON Example given below
    }
  });
}

function cancelFileUpload(upjobId) {
  upjobId = parseInt(upjobId);
  alert(upjobId);
  room.cancelUploads(upjobId, false, function (cnclresps) {
    console.log("cnclresps ============", cnclresps);
    if (cnclresps.result == "0") {
      // Success JSON Example given below
    } else {
      // Error JSON Example given below
    }
  });
}

function cancelDownloadFile(jobId) {
  jobId = parseInt(jobId);
  alert(jobId);
  room.cancelDownloads(jobId, false, function (cncldwnlresps) {
    console.log("cncldwnlresps ============", cncldwnlresps);
    if (cncldwnlresps.result == "0") {
      // Success JSON Example given below
    } else {
      // Error JSON Example given below
    }
  });
}

function changeVideoQuality(quality) {
  // alert(quality);
  let qualityOptions = {
    videoQuality: quality,
    streamType: "talker",
  };
  room.setReceiveVideoQuality(qualityOptions, function (changeResult) {
    console.log("changeResult ....", changeResult);
    if (changeResult.result == 0) {
      // Success
    } else {
      // Faileld - result.message
    }
  });
}

var onlyAudio = false;
function toggleAudioMode() {
  onlyAudio = !onlyAudio;
  // alert(onlyAudio);
  room.setAudioOnlyMode(onlyAudio);
  updateVideoIcon();
}


function videoMute() {
  onlyAudio = !onlyAudio;
  if (!onlyAudio) {
    localStream.unmuteVideo(function (res) {
      var streamId = localStream.getID();
      var player = document.getElementById("stream" + streamId);
      player.srcObject = localStream.stream;
      player.play();
      updateVideoIcon();
    });
  } else {
    localStream.muteVideo(function (res) {
      updateVideoIcon();
    });
  }
}

function updateVideoIcon(){
  var elem = document.getElementsByClassName("icon-confo-video-mute")[0];
  var onImgPath = "img/video.png" ;
  var offImgPath = "img/mute-video.png";
  if (onlyAudio) {
    elem.src = offImgPath;
    elem.title = "unmute video";  
    // document.getElementById('only_audio').checked = true;
  } else {
    elem.src = onImgPath;
    elem.title = "mute video";
    // document.getElementById('only_audio').checked = false;
  }
}


var muteAll = false;
function hardMute() {
  muteAll = !muteAll;
  if (muteAll == true) {
    room.hardMute(function (muteResult) {
      console.log("muteResult    ", muteResult);
    });
  } else {
    room.hardUnmute(function (unmuteResult) {
      console.log("unmuteResult    ", unmuteResult);
    });
  }
}

function endSession() {
  room.destroy();
}



function refreshAwaitingList(room) {
  document.getElementById("awaitingPrticipants").innerHTML = "";
  awaitingParticipants = [];
  // if(room.hasOwnProperty('awaitedParticipants')){
  awaitingParticipants = room.awaitedParticipants;
  // }

  console.log("awaitingParticipants    ", awaitingParticipants);
  if (awaitingParticipants.size > 0) {
    awaitingParticipants.forEach(function (value, key) {
      console.log("awaitingParticipants    ", value);
      console.log("awaitingParticipants    ", key);
      let awaiting_user = document.createElement("div");
      awaiting_user.setAttribute("class", "awaiting_user");
      awaiting_user.innerHTML = value.name;

      let allow_icon = document.createElement("i");
      allow_icon.setAttribute("class", "fa fa-check");
      allow_icon.setAttribute("data-id", key);
      awaiting_user.appendChild(allow_icon);

      let deny_icon = document.createElement("i");
      deny_icon.setAttribute("class", "fa fa-close");
      deny_icon.setAttribute("data-id", key);
      awaiting_user.appendChild(deny_icon);

      awaiting_user.setAttribute("id", key);
      document.getElementById("awaitingPrticipants").appendChild(awaiting_user);

      allow_icon.addEventListener("click", function (e) {
        console.log("E    ", e);
        room.approveAwaitedUser(key, function (approveStatus) {
          console.log("approveStatus    ", approveStatus);
          document.getElementById(key).remove();
          refreshAwaitingList(room);
        });
      });

      deny_icon.addEventListener("click", function (e) {
        console.log("E    ", e);
        room.denyAwaitedUser(key, function (approveStatus) {
          console.log("approveStatus    ", approveStatus);
          document.getElementById(key).remove();
          refreshAwaitingList(room);
        });
      });
    });
    document.getElementById("waiting_list").style.display = "block";
  } else {
    document.getElementById("waiting_list").style.display = "none";
  }
}

var isRecording = false;
function toggleRecording() {
  isRecording = !isRecording;
  if (isRecording == true) {
    room.startRecord(function (startStatus) {
      console.log("startStatus   ", startStatus);
      if (startStatus.result == 0) {
        document
          .getElementById("recoding_icon")
          .setAttribute("class", "fa fa-pause");
      }
    });
  } else {
    room.stopRecord(function (stopStatus) {
      console.log("stopStatus   ", stopStatus);
      if (stopStatus.result == 0) {
        document
          .getElementById("recoding_icon")
          .setAttribute("class", "fa fa-play");
      }
    });
  }
}

var isChatboatOpen = false;
function toggleChatBoat() {
  isChatboatOpen = !isChatboatOpen;
  let displayStatus = isChatboatOpen == true ? "block" : "none";
  document.getElementById("message_container").style.display = displayStatus;

  if (isChatboatOpen) {
    document
      .getElementById("chat_icon")
      .setAttribute("class", "fa fa-comments-o");
  }
}

function setTalkers() {
  let newCount = parseInt(prompt("Please input the number between 1-6..."));
  room.setTalkerCount(newCount, function (updateStatus) {
    console.log("updateStatus ......", updateStatus);
  });
  alert(newCount);
}

function addParticipantToList(remoteName, clientId){
 
  let participant = document.createElement('div');
  participant.setAttribute('class', 'participant_each')
  participant.innerHTML = remoteName ;

  
  let hostControls = document.createElement('div');  
  hostControls.setAttribute('class', 'host_controls');
  
  let mic = document.createElement('i');
  mic.setAttribute('class', 'fa fa-microphone');
  mic.setAttribute('data-client-id', clientId);
  mic.setAttribute('title', 'Toggle Audio');
  mic.addEventListener('click', function(e){
    let classList  = e.target.classList;
    if(classList.contains('fa-microphone-slash')){
      room.hardUnmuteUserAudio(clientId, function (muteResult) {
        console.log("USER MUTE RESULT", clientId, muteResult);
      });
      classList.remove('fa-microphone-slash');
    }else{
      room.hardMuteUserAudio(clientId, function (unmuteResult) {
        console.log("USER UNMUTE RESULT", clientId, unmuteResult);
      });
      classList.add('fa-microphone-slash');
    }
  });
  hostControls.appendChild(mic);

  let video = document.createElement('i');
  video.setAttribute('class', 'fa fa-play');
  video.setAttribute('data-client-id', clientId);  
  video.setAttribute('title', 'Toggle Video');
  video.addEventListener('click', function(e){
    let classList  = e.target.classList;
    if(classList.contains('fa-pause')){
      room.hardUnmuteUserVideo(clientId, function (muteResult) {
        console.log("USER VIDEO MUTE RESULT", clientId, muteResult);
      });
      classList.remove('fa-pause');
    }else{
      room.hardMuteUserVideo(clientId, function (unmuteResult) {
        console.log("USER VIDEO UNMUTE RESULT", clientId, unmuteResult);
      });
      classList.add('fa-pause');
    }
  });
  hostControls.appendChild(video);  

  let host = document.createElement('i');
  host.setAttribute('class', 'fa fa-user-circle-o');
  host.setAttribute('title', 'Make Moderator');
  host.setAttribute('data-client-id', clientId);
  host.addEventListener('click', function(e){   
    room.switchUserRole(clientId, function (switchResult) {
      console.log("USER Role Switch RESULT", clientId, switchResult);
    });
  });
  hostControls.appendChild(host);

  let disconnectUser = document.createElement('i');
  disconnectUser.setAttribute('class', 'fa fa-user-times disconnect_user');
  disconnectUser.setAttribute('data-client-id', clientId);  
  disconnectUser.setAttribute('title', 'Disconnect');
  disconnectUser.addEventListener('click', function(){
      alert("User disconnect...." + clientId);
      room.dropUser([clientId], function (dropResult) {
        console.log("USER DROP RESULT", dropResult);
      });
  })
  hostControls.appendChild(disconnectUser);

  document.getElementById('allPrticipants').appendChild(participant);
  if(room.me.role != 'moderator'){
    hostControls.style.display = 'none';
  }
  document.getElementById('allPrticipants').appendChild(hostControls);
}

var isToolVisible = false;
function toggleTools(){
  isToolVisible = !isToolVisible;
  let display = isToolVisible ? 'block' : 'none';
  document.querySelector('.tools').style.display = display;
}

function requestFloor(){
  room.requestFloor(function (requestResult) {
    console.log('Request Result...', requestResult)
    if(requestResult.result == 0) {
       /* Success */  
       document.getElementById('cancel-floor-request').style.display = 'block';
       document.getElementById('floor-request').style.display = 'none';
    } else {
       /* Error - Print arg.msg */ 
    }
  });
}

function hideFloorControls(){
  document.getElementById('floor-request').style.display = 'block'; 
  document.getElementById('finish-floor').style.display = 'none'; 
  document.getElementById('local_video_div').innerHTML = ''; 
  document.getElementById('local_video_div').setAttribute('style', ''); 
  document.querySelectorAll('.publisher-control').forEach(function(ele){
    ele.style.display = 'none';
  });
}

function finishFloor(){
  room.finishFloor(function (finishResult) {
    console.log("Finish Result.....", finishResult);
    if(finishResult.result == 0) {
      // Floor Access is finished
      hideFloorControls();      
    }
  });
}

function cancelFloorRequest(){
  room.cancelFloor(function (cancelResult) {
    console.log('Cancel Result...', cancelResult)
    if(cancelResult.result == 0) {
       /* Success */  
       document.getElementById('cancel-floor-request').style.display = 'none';
       document.getElementById('floor-request').style.display = 'block';
    } else {
       /* Error - Print arg.msg */ 
    }
  });
}

function releaseFunction(releaseStatus) {
  if (releaseStatus.result == 0) {
    /* Success */ 
    document.getElementById('releaseFloor').removeEventListener('click', releaseFunction);
    document.getElementById('releaseFloor').remove();
  } else {
    /* Error - Print arg.msg */ 
  }
}



