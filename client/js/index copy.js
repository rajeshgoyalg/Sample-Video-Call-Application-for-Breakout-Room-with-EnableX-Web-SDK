///////////////////////////////////////////////////////
//
// File: index.js
// Login Screen. Accepts login information and moves on to Conference Page.
// It also has extra utility to create a roomId
//
/////////////////////////////////////////////////////

window.onload = function () {
  $(".login_join_div").show();
};

var username = "demo";
var password = "enablex";

// Verifies login credentials before moving to Conference page

document
  .getElementById("login_form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.querySelector("#nameText"),
      room = document.querySelector("#roomName"),
      agree = document.querySelector('[name="agree"]'),
      errors = [];
    if (name.value.trim() === "") {
      errors.push("Enter your name.");
    }
    if (room.value.trim() === "") {
      errors.push("Enter your Room Id.");
    }

    if (!agree.checked) {
      errors.push("Accept terms of use and privacy policy.");
    }

    if (errors.length > 0) {
      var mappederrors = errors.map(function (item) {
        return item + "</br>";
      });
      var allerrors = mappederrors.join("").toString();
      $.toast({
        heading: "Error",
        text: allerrors,
        showHideTransition: "fade",
        icon: "error",
        position: "top-right",
        showHideTransition: "slide",
      });

      return false;
    }

    // joinRoom(document.getElementById('roomName').value, function (data) {

    //     if (!jQuery.isEmptyObject(data)) {

    //         var user_ref = document.getElementById('nameText').value;
    //         var usertype = undefined;
    //         if (document.getElementById('moderator').checked) {
    //             usertype = document.getElementById('moderator').value;
    //         }
    //         if (document.getElementById('participant').checked) {
    //             usertype = document.getElementById('participant').value;
    //         }

    //         window.location.href = "confo.html?roomId=" + data.room_id + "&usertype="+usertype+"&user_ref=" + user_ref;
    //     } else {
    //         alert('No room found');
    //     }
    // });

    /********************************************************************************/
    let roomName = $("#roomName").val();
    let userType = $('input[name="usertype"]').val();
    let userName = $("#nameText").val();
    let token;
    var room;
    $.ajax({
      url: baseUrl + "/api/get-room/?roomId=" + roomName,
      type: "get",
      success: function (room_data) {
        console.log(room_data);
        if (room_data.result == 0) {
          let details = {
            name: userName,
            role: userType,
            roomId: room_data.room.room_id,
            user_ref: room_data.room.owner_ref,
          };

          var xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              var response = JSON.parse(this.responseText);
              if (response.error) {
                $.toast({
                  heading: "Error",
                  text: response.error,
                  showHideTransition: "fade",
                  icon: "error",
                  position: "top-right",
                  showHideTransition: "slide",
                });
                return false;
              } else {
                console.log("token", response);
                token = response.token;
                room = EnxRtc.EnxRoom({ token: token });
                console.log("room", room);
                let reConnectOpt = {
                  allow_reconnect: true,
                  number_of_attempts: 3,
                  timeout_interval: 10000,
                };
                room.addEventListener("room-connected", function (event) {
                    // Connected. event receives Room Meta JSON
                    $(".login_join_div").hide();
                    console.log("event VVVVVVVVVVVVVVVVV", event);
                    alert("Çonnected");
                    var streamOpt = {
                        audio: true, 
                        video: true, 
                        data: true, 
                        options: options,
                        attributes: { name:'Initial Stream' }
                    };
                    var publishOpt = {};
                
                    var localStream = EnxRtc.EnxStream( streamOpt );
                    // console.clear();
                    console.log('localStream', localStream);

                    room.publish(localStream, publishOpt, function(StreamId) {
                        
                        console.log('Stream Publisheddsadasdsadas', localStream);
                        setLiveStream(localStream);
                        alert('dfgdfgdf');
                    });

                });

                room.addEventListener("room-failed", function (error) {
                  // Connection failed. Find error
                  alert("Çonnection failed");
                });

                room.addEventListener("room-allowed", function (event) {
                  // User is allowed into the room after being awaited
                  alert("room allowed");
                });

                room.addEventListener("user-connected", function (event, user) {
                  // A new user connected. user JSON has user information
                });

                room.addEventListener("user-awaited", function (event, user) {
                  // A new user awaited permission to get connected
                  // user JSON has user information
                });

                room.addEventListener(
                  "active-talkers-updated",
                  function (event) {
                    // List of talkers in the Room
                    // Received after room-connected
                  }
                );

                room.connect(reConnectOpt, function (success) {
                    // console.clear();
                    console.log(" success", success);
                  alert('Connection requested...'); //Not sure when this callback be executed...
                  if (success && success != null) {
                    if (room.waitRoom && room.me.role != "moderator") {
                      // Wait for Moderator
                    }
                  }
                });
              }
            }
          };
          xhttp.open("POST", baseUrl + "/api/create-token/", true);
          xhttp.setRequestHeader("Content-Type", "application/json");
          xhttp.send(JSON.stringify(details));
        } else {
        }
      },
    });

    /********************************************************************************/
  });

var loadingElem = document.querySelector(".loading");
document
  .getElementById("create_room")
  .addEventListener("click", function (event) {
    loadingElem.classList.add("yes");
    createRoomMulti(function (result) {
      document.getElementById("roomName").value = result;
      document.getElementById("create_room_div").style.display = "none";
      document.getElementById("message").innerHTML =
        "We have prefilled the form with room-id. Share it with someone you want to talk to";
    });
  });

var createRoomMulti = function (callback) {
  var apiUrl = "/api/room/multi/";
  if (typeof baseUrl !== "undefined") {
    // todo - to support PHP app api url
    apiUrl = baseUrl + apiUrl;
  }
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText);
      if (response.error) {
        $.toast({
          heading: "Error",
          text: response.error,
          showHideTransition: "fade",
          icon: "error",
          position: "top-right",
        });
      } else {
        callback(response.room.room_id);
        loadingElem.classList.remove("yes");
      }
    }
  };
  xhttp.open("POST", apiUrl, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    "Basic " + btoa(username + ":" + password)
  );
  xhttp.send();
};


var options = {
    id: 'vcx_1001',
    attachMode: '',
    player: {
        'autoplay': '',
        'name': '',
        'nameDisplayMode': '',
        'frameFitMode': 'bestFit',
        'skin': 'classic',
        'class': '',
        'height': "inherit",
        'width': 'inherit',
        'minHeight': '120px',
        'minWidth': '160px',
        'aspectRatio': '',
        'volume': 0,
        'media': '',
        'loader': {
            'show': false, 'url': 'img/loader.gif', 'style': 'default', 'class': ''
        },
        'backgroundImg': 'img/player-bg.gif'
    },
    toolbar: {
        'displayMode': 'auto',
        'autoDisplayTimeout': 0,
        'position': 'top',
        'skin': 'default',
        'iconset': 'default',
        'class': '',
        'buttons': {
            'play': false,
            'share': false,
            'mic': false,
            'resize': false,
            'volume': false,
            'mute': false,
            'record': false,
            'playtime': false,
            'zoom': false,
        },
        'branding': {
            'display': false,
            'clickthru': 'https://www.enablex.io',
            'target': 'new',
            'logo': 'img/enablex.png',
            'title': 'EnableX',
            'position': 'right'
        }
    }
};
var setLiveStream = function (stream,remote_name) {

    // Listening to Text Data
    stream.addEventListener('stream-data', function (e) {

        var text = e.msg.textMessage;
        var html = $(".multi_text_container_div").html();
        $("#multi_text_container_div").html(html + text + "<br>");
    });
    var name = (stream.getAttributes().name !== undefined) ? stream.getAttributes().name : ""
    if (!stream.local) {
        var newStreamDiv = document.createElement('div');
        newStreamDiv.setAttribute('id', 'liveStream_' + countStream);
        newStreamDiv.setAttribute('class', 'live_stream_div col-md-3 col-sm-3');
        var nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'name-div');
        nameDiv.innerHTML = remote_name;
        newStreamDiv.appendChild(nameDiv);
        var multi_video_div = document.getElementById('multi_video_container_div');
        multi_video_div.appendChild(newStreamDiv);
        options.player.height = "inherit";
        options.player.width = "inherit";
        options.player.class = "test_class";

        stream.show('liveStream_' + countStream, options);
        countStream++;
    }
    else {
        options.player.height = "inherit";
        options.player.width = "inherit";
        options.player.loader.class = "";
        options.player.loader.show = false;
        var controlsDiv = document.getElementById('controls-div');
        controlsDiv.style.display = "block";
        var nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'name-div');
        nameDiv.innerHTML = name;
        document.getElementById('local_video_div').appendChild(controlsDiv);
        document.getElementById('local_video_div').appendChild(nameDiv);
        stream.show('local_video_div', options);
    }

}
