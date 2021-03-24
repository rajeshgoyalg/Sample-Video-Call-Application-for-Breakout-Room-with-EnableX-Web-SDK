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
var room, breakoutRoomId, breakedOutRoom;
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

  var setBreakoutRoomStream = function (stream, remote_name, client_id) {      
    var newStreamDiv = document.createElement("div");
    newStreamDiv.setAttribute("id", "breakoutLiveStream_" + client_id);
    newStreamDiv.setAttribute("class", "live_stream_div");
    var nameDiv = document.createElement("div");
    nameDiv.setAttribute("class", "name-div");
    nameDiv.innerHTML = remote_name + "<i id='mike_" + client_id + "'></i>";
    newStreamDiv.appendChild(nameDiv);
    let multi_video_div = document.getElementById("breaked_video_container_div");
    multi_video_div.appendChild(newStreamDiv);
    options.player.height = "inherit";
    options.player.width = "inherit";
    options.player.class = "test_class";
    if(client_id == 'me'){
      let videoControls = document.getElementById('breakout_call_controls').cloneNode(true);
      console.log("videoControls", videoControls);
      videoControls.style.display = 'block';
      newStreamDiv.appendChild(videoControls);
    }

    stream.play("breakoutLiveStream_" + client_id, options);
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
        if(room.waitRoom){
          let roomSettings = room.roomSettings;
          let infoText = 'Wait for moderator to join...!';
          if(roomSettings.knock == true){
            infoText = 'Wait moderator to allow you...!';
          }
          document.getElementById('info_container').innerHTML = infoText;
          document.getElementById('info_container').style.display = 'block';
        }else{
          document.getElementById('info_container').style.display = 'none';
          if (urlData.usertype[0] == "moderator") {
            $("#moderatorOptions").show();
          }
          setLiveStream(localStream);
          console.log("ROOM ........", room);
          console.log("Success STREAMS.....", success.streams);
          for (var i = 0; i < success.streams.length; i++) {
            room.subscribe(success.streams[i]);
          }
      }
        addAllEvenListners(room);
        refreshAwaitingList(room);
        refreshParticipantList(room);
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
    refreshParticipantList(room);
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
        // $("#allPrticipants").html("");
        for (stream in room.remoteStreams.getAll()) {
          var st = room.remoteStreams.getAll()[stream];
          for (j = 0; j < ATList.length; j++) {
            var remote_name = ATList[j].name;
            var client_id = ATList[j].clientId;
            if (ATList[j].streamId == st.getID()) {
              setLiveStream(st, remote_name, client_id);             
              // addParticipantToList(remote_name, client_id);
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

  // Stream went out of Room
  room.addEventListener("stream-removed", function (event) {
    // console.log("stream removed", event);
  });

  //handle if knock is enabled for room and moderator allows a participant
  room.addEventListener("room-allowed", function (event) {
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
      // console.log("Moderator disconnected you...!");
    }
    window.location.href = SUPPORT_URL;
  });

  //handle remote user disconnection on other user side
  room.addEventListener("user-disconnected", function (event) {
    console.log("Remote user disconnected event...", event);
    // console.log("disconnected client_id " + event.clientId);
    // $("#liveStream_" + event.clientId).remove();
    refreshParticipantList(room);
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
        console.log("Upload Start...", msg);
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
        // console.log('upload completed');
        console.log("UPLOAD DONEEEEEE", msg);
        upJobId = msg.response.upJobId;
        $("#up_cancel_" + upJobId).remove();
        break;
      case "upload-failed":
        // Know msg.upJobId has failed
        // upload-failed event JSON Example given belowbreak;
        // console.log("upload failed");
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

        //   console.log("download availableeeee.....");
        let newFileThread = document.createElement('div');
        let userName = document.createElement('b');
        userName.textContent = sender+" : ";
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
        // console.log("download started.....", msg);
        break;
      case "download-completed":
        // Know msg.jobId is completed
        // download-completed event JSON Example given belowbreak;
        // console.log("download completed.....");
        break;
      case "download-failed":
        // Know msg.jobId has failed
        // download-failed event JSON Example given belowbreak;
        // console.log("download failed.....");
        break;
      default:
        break;
    }
  });

  //Listner for hard mute room done by moderator
  room.addEventListener("hard-mute-room", function () {
    // console.log('Moderator muted the room.....');
    muteMic();
  });

  //Listner for hard unmute room done by moderator
  room.addEventListener("hard-unmute-room", function () {
    // console.log('Moderator unmuted the room.....');
    unmuteMic();
  });

  //Listner for hard mute participant done by moderator
  room.addEventListener("hardmute-user-audio", function () {
    // console.log('Moderator muted the room.....');
    muteMic();
  });

  //Listner for hard unmute participant done by moderator
  room.addEventListener("hardunmute-user-audio", function () {
    // console.log('Moderator unmuted the room.....');
    unmuteMic();
  });

  //Listner for user role changed
  room.addEventListener("user-role-changed", function (event) {
    console.log("role data ..... ", event);
    // console.log('handle role changed ');
    let eventData = event.message;
    let modControlVisibility = 'none';
    if (myClientId == eventData.moderator.new) {
      modControlVisibility = 'block';
    }
    // console.log(modControlVisibility);
    document.getElementById("moderatorOptions").style.display = modControlVisibility;
    document.querySelectorAll('.host_controls').forEach(function(controls){
      controls.style.display = modControlVisibility;
    });
    
  });

  //Listner for recording on
  room.addEventListener("room-record-on", function (event) {
    // Recording started, Update UI
    // event.message.moderatorId = Moderator who stated recording.
    console.log("recording started....");
  });

  // Notification recording stopped to all
  room.addEventListener("room-record-off", function (event) {
    // Recording stopped, Update UI
    // event.message.moderatorId = Moderator who stopped recording.
    console.log("recording stopped....");
  });

  // Listen to event to know when Extension Window is open
  room.addEventListener('conference-remaining-duration', function(event) {
    var timeLeft = event.message.timeLeft;
    console.log('Session is expiring soon....');
    // Show UI to all usersr or to participant to
    // trigger EXTEND by caling method.
  });


  //ADDED FOR BRAKOUT FEATURE********************************************************************
  // Users get invite to join Break-Out Room 
  room.addEventListener("join-breakout-room", function (event) {
    console.log('INVITATION DETAILS....', event);
    let breakoutRoomId = event.message.room_id;
    let joinBreakoutRoomButton = document.createElement('button');
    joinBreakoutRoomButton.setAttribute('id', 'joinBreakutRoom');
    joinBreakoutRoomButton.setAttribute('class', 'btn btn-sm btn-info');
    joinBreakoutRoomButton.appendChild(document.createTextNode('Join Breakout Room'));
    joinBreakoutRoomButton.breakoutRoomId = breakoutRoomId;
    joinBreakoutRoomButton.addEventListener('click', joinBreakoutRoom, false);
    document.getElementById('breakoutButtons').innerHTML = '';
    document.getElementById('breakoutButtons').appendChild(joinBreakoutRoomButton);
    // document.getElementById('breakoutCreateButtons').style.display = 'none';
    isToolVisible = false;
    toggleTools();
  }); 
  // User is notified that he is disconnected from Break-Out Room
  room.addEventListener("breakout-room-disconnected", function (event) {
    console.log('disconnected from breakout room....');
  });
  room.addEventListener("breakout-room-disconnect", function (event) {
    console.log('disconnected from breakout room....');
  });

  room.addEventListener("breakout-room-destroyed", function (event) {
    // console.log('Destroyed from breakout room....');
  });
  //ADDED FOR BRAKOUT FEATURE********************************************************************
}
//EVENT LISTNERS***************************************************************************

// $(function () {
//   $(document).on("click", ".fa-download", function () {
//     let jobId = $(this).attr("id");
//     $(this)
//       .parent()
//       .append(
//         '<i id="cancel_' +
//           jobId +
//           '" onclick="cancelDownloadFile(' +
//           jobId +
//           ')" class="fa fa-trash"></i>'
//       );
//     // alert('download clicked.....'+jobId);
//   });
// });
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
    // console.log('Disconnecting.....')
    window.location.href = SUPPORT_URL;
  }
}

var sharing = false;
function shareScreen() {
  // console.log('share screen');
  sharing = !sharing;
  if (sharing) {
    streamShare = room.startScreenShare(function (shareResult) {
      // console.log('share screen started');
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
  // console.log("File Selected");
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
  console.log(jobId);
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
  console.log(upjobId);
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
  console.log(jobId);
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
function refreshParticipantList(room){
  $("#allPrticipants").html("");
  roomUsers = room.userList;

  console.log('Room Users.....', roomUsers);
  roomUsers.forEach(function(value, key){
      let remoteName = value.name;
      let clientId = value.clientId;
      if(room.me.clientId != clientId){
        addParticipantToList(remoteName, clientId);
      }
      
  });
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
      console.log("User disconnect...." + clientId);
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
  document.querySelector('.invitee_list').style.display = 'none';
}



//ADDED FOR BRAKOUT ROOM FEATURE********************************************************************
function breakoutRoom(){
  let RoomDefinition = {
    "participants": 4, 
    "audio": true,
    "video": false, 
    "canvas": false, 
    "share": false,
  }
  room.createBreakOutRoom(RoomDefinition, function(bRomData) {
    // data is JSON with created Break-Out Room Information, e.g.
    console.log('Breakout Room Data....', bRomData)
    if(bRomData.result == 0){
      breakoutRoomId = bRomData.msg.rooms[0];
      document.getElementById('breakout_btn').style.display = 'none';
      document.getElementById('invite_btn').style.display = 'block';
    }
  });
}

function ShowInviteeList(){
  toggleTools();
  document.getElementById('inviteeContainer').style.display = 'block';
    console.log('ROOM USER LIST.....', room.userList);
    let listContainer = document.getElementById('inviteeContainer');
    listContainer.innerHTML = "";
    let heading = document.createElement('b');
    heading.appendChild(document.createTextNode("Choose Participant"));
    listContainer.appendChild(heading)
    room.userList.forEach((value, key) => {      
      if(room.me.clientId != key){
        
        let eachParticipant = document.createElement('div');
        let chechbox = document.createElement('input');
        chechbox.setAttribute('type', 'checkbox');
        chechbox.setAttribute('value', key);
        chechbox.setAttribute('class', 'invitee');
        eachParticipant.appendChild(chechbox);
        eachParticipant.appendChild(document.createTextNode(value.name));
        listContainer.appendChild(eachParticipant);
      }
    });

    let inviteButton= document.createElement('button');
    inviteButton.setAttribute('class', 'btn btn-sm btn-success');
    inviteButton.setAttribute('id', 'inviteNow');
    inviteButton.appendChild(document.createTextNode('Invite'));
    inviteButton.addEventListener('click', inviteParticipants);
    listContainer.appendChild(inviteButton);
}

function inviteParticipants(){
  // alert('Invite');
  let clients = [];
  document.querySelectorAll('.invitee').forEach(invitee => {
    if(invitee.checked){
      clients.push(invitee.value);
    }
  });
  if(clients.length < 1){
    alert('No Invitees selected..');
    return false;
  }

  let inviteData = {
    clients,
    room_id : breakoutRoomId
  }
  room.inviteToBreakoutRoom(inviteData, function(inviteResult) {
    console.log("Invite Result ...... ", inviteResult);
    if(inviteResult.result == 0){
      document.getElementById('inviteNow').removeEventListener('click', inviteParticipants);
      document.getElementById('inviteNow').remove();
      document.getElementById('inviteeContainer').style.display = 'none'; 
      handleBreakoutRoomJoining(breakoutRoomId);
    }
  });

}


function joinBreakoutRoom(event){
  console.log('EVENT.....', event);
  breakoutRoomId = event.target.breakoutRoomId;
  // alert('Join now .. '+ breakoutRoomId);
  handleBreakoutRoomJoining(breakoutRoomId); 
  document.getElementById('joinBreakutRoom').removeEventListener('click', joinBreakoutRoom);
  document.getElementById('joinBreakutRoom').remove();
  toggleTools();
}

function muteParentRoom(){
  let muteInfo = {
    "audio" : true, 
    "video" : false
  };    
  console.log('Mute Option.....', muteInfo);
  room.muteRoom(muteInfo, function(roomMuteResult) {
    // resp carries status
    console.log('Mute parent Room Result.....', roomMuteResult);
    muteMic();
  });
}

function unmuteParentRoom(){
  let unmuteInfo = {
    "audio" : true, 
    "video" : false
  };
  console.log('Unmute Option.....', unmuteInfo);
  room.unMuteRoom(unmuteInfo, function(roomUnmuteResult) {
    // resp carries status
    console.log('Unmute parent Room Result.....', roomUnmuteResult);
    unmuteMic();
  });
}

function pauseParentRoom(){  
  room.pauseRoom(function(roomPauseResult) {
    // resp carries status
    console.log('Pause parent Room Result.....', roomPauseResult);
    muteMic();
  });
}

function resumeParentRoom(){ 
  room.resumeRoom(function(roomResumeResult) {
    // resp carries status
    console.log('Resume parent Room Result.....', roomResumeResult);
    unmuteMic();
  });
}

var breakout_local_stream;
function handleBreakoutRoomJoining(breakoutRoomId){
  // User may join rooom now
	// Read JoinBreakOutRoom() later in the document
	let joinee = {
		"role" : "participant", 
		"room_id" : breakoutRoomId
	};

	let streamInfo = {
		"audio": true, 
		"video" : false,
		"canvas" : false,
		"screen" : false
	};
	
	room.joinBreakOutRoom(joinee, streamInfo, function(joinResult) {
    console.log("Join Result.......", joinResult);
    breakedOutRoom = joinResult.room;  
    breakout_local_stream = joinResult.localStream;
    // alert(breakout_local_stream.clientId);
    setBreakoutRoomStream(breakout_local_stream, username, 'me');      
    document.getElementById('breakoutRoomWrapper').style.display = 'block'; 

    breakedOutRoom.addEventListener('room-connected', function(event){
      console.log('BREAK ROOM CONNECTED EVENT......');
      muteParentRoom();
      // pauseParentRoom();
    });
    // });

    // Active Talker list is updated
    breakedOutRoom.addEventListener("active-talkers-updated", function (event) {
      console.log("Active Talker List :- ", event.message.activeList);
      // alert('Active talker updated ..... ');
      ATList = event.message.activeList;
      
      var video_player_len = document.querySelector("#breaked_video_container_div").childNodes;

      if (
        event.message &&
        event.message !== null &&
        event.message.activeList &&
        event.message.activeList !== null
      ) {
        // alert('have active talker...');
        console.log(ATList.length, ' == ', video_player_len.length);
        if (ATList.length == video_player_len.length - 1) {
          return;
        } else {
          document.querySelector("#breaked_video_container_div").innerHTML = "";
          setBreakoutRoomStream(breakout_local_stream, username, 'me');
          for (stream in breakedOutRoom.remoteStreams.getAll()) {
            var st = breakedOutRoom.remoteStreams.getAll()[stream];
            for (j = 0; j < ATList.length; j++) {
              var remote_name = ATList[j].name;
              var client_id = ATList[j].clientId;
              if (ATList[j].streamId == st.getID()) {
                setBreakoutRoomStream(st, remote_name, client_id);
              }
            }
          }
        }
      }else{
        // alert('No active talker...');
        document.querySelector("#breaked_video_container_div").innerHTML = "";
        setBreakoutRoomStream(breakout_local_stream, username, 'me'); 
      }
      
    });

    breakedOutRoom.addEventListener('room-disconnected', function(event){
      console.log('BREAK ROOM DiSCONNECTED EVENT......', event);
      // unmuteParentRoom();
      resumeParentRoom();
      document.getElementById('breakout_btn').style.display = 'block';
      document.getElementById('invite_btn').style.display = 'none';
    });
    
    
	});
}

var isMutedInBreakRoom = false;
function muteBreakRoomLocalStream(){
  if(isMutedInBreakRoom == true){
    breakout_local_stream.unmuteAudio(function (unmuteResult) {
      console.log("UnMute Result ......", unmuteResult);
      if(unmuteResult.result == 0){
        isMutedInBreakRoom = !isMutedInBreakRoom;
        document.getElementById('muteMeInBreakRoom').classList.remove('fa-microphone-slash');
      }
    });
  }else{
    breakout_local_stream.muteAudio(function (muteResult) {
        console.log("Mute Result ......", muteResult);
        if(muteResult.result == 0){
          isMutedInBreakRoom = !isMutedInBreakRoom;
          document.getElementById('muteMeInBreakRoom').classList.add('fa-microphone-slash');
        }
    });
  }
}

function disconnectBreakRoom(){
  breakedOutRoom.disconnect();
  isMutedInBreakRoom = false;
  document.getElementById('breakoutRoomWrapper').style.display = 'none';  
  document.getElementById('breaked_video_container_div').innerHTML = '';
}
//ADDED FOR BRAKOUT ROOM FEATURE********************************************************************
