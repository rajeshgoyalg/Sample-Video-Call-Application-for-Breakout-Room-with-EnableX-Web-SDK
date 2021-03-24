///////////////////////////////////////////////////////
//
// File: room.js
// This function fetches Room-Information for a given RoomID.
//
/////////////////////////////////////////////////////


var joinRoom = function (roomName, callback) {
	var apiUrl = '/api/get-room/';
	if (typeof baseUrl !== 'undefined') {
		// todo - to support PHP app api url
		apiUrl = baseUrl + apiUrl + '?roomId=' + roomName;
	} else {
        apiUrl = apiUrl + roomName;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response =  JSON.parse(this.responseText);
            console.log("room details .....", response); 
            // return false;
            if(response.error){
                $.toast({
                    heading: 'Error',
                    text: response.error,
                    showHideTransition: 'fade',
                    icon: 'error',
                    position: 'top-right',
                    showHideTransition: 'slide'
                });
            }
            else {
                callback(response.room);
            }


        }
    };
    xhttp.open("GET", apiUrl, true);
    xhttp.send();
};

