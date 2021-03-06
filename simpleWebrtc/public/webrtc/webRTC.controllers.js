"use strict";

angular.module("WebRTC.Controllers", [

])
.controller('WebRTCCtrl', function ($scope, $routeParams, $location) {
    $scope.roomTitle = $routeParams.room;
    $scope.shareValue = 'Share My Screen';
    $scope.facultySharingScreen = false;
    $scope.facultySharingVideo = false;
    $scope.studentSharingVideo = false;
    $scope.chatMessages = [];

    if (!$scope.roomTitle) {
        $scope.roomTitle = "Start a Room";
    } else {
        $scope.roomOwned = true;
    }

    // create our webrtc connection
    $scope.webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: false,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });

    $scope.joinRoom = function() {
        if ($scope.roomOwned) {
            $scope.webrtc.joinRoom($scope.roomTitle, $scope.studentName, function() {
                $scope.webrtc.sendToAll('joinRoom', {type: 'joinRoom', username: $scope.studentName});
            });
        } else {
            $scope.webrtc.startLocalVideo();
        }
        $scope.userName = $scope.studentName;
    };

    $scope.webrtc.on('chat', function(payload) {
        console.log(payload);
        $scope.chatMessages.push({
            username: payload.username,
            text: payload.text,
            timestamp: payload.timestamp
        });

        $scope.$digest();
    });

    $scope.checkForEnter = function(event) {
        if(event.keyCode === 13) {
            $scope.sendMessage();
        }
    };

    $scope.sendMessage = function() {
        var messageObj = {
            type: 'chat',
            name: $scope.roomName,
            username: $scope.userName,
            text: $scope.chatMessage
        };
        $scope.webrtc.sendToAll('chat', messageObj);
        
        $scope.chatMessages.push({
            username: $scope.userName,
            text: $scope.chatMessage,
            timestamp: new Date()
        });

        $scope.chatMessage = '';
    };

    function showVolume(el, volume) {
        if (!el) return;
        if (volume < -45) { // vary between -45 and -20
            el.style.height = '0px';
        } else if (volume > -20) {
            el.style.height = '100%';
        } else {
            el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
        }
    };

    $scope.webrtc.on('channelMessage', function (peer, label, data) {
        if (data.type == 'volume') {
            showVolume(document.getElementById('volume_' + peer.id), data.volume);
        }
    });

    $scope.webrtc.on('videoAdded', function (video, peer) {
        console.log("videoadded?", video, peer);
        // if (peer.type === 'screen') {
            console.log(peer.type)
            var container;
            if(peer.faculty && peer.type !== 'screen') {
                $scope.facultySharingVideo = true;
                container = angular.element('.faculty-video');
            } else if(peer.type == 'screen'){
                $scope.facultySharingScreen = true;
                container = angular.element('.faculty-screen');
            } else {
                container = angular.element('.student-video');
            }

            if (container) {
                var d = document.createElement('div');
                d.className = 'videoContainer';
                d.id = 'container_' + $scope.webrtc.getDomId(peer);
                d.appendChild(video);
                var vol = document.createElement('div');
                vol.id = 'volume_' + peer.id;
                vol.className = 'volume_bar';
                video.onclick = function () {
                    video.style.width = video.videoWidth + 'px';
                    video.style.height = video.videoHeight + 'px';
                };
                d.appendChild(vol);
                container.append(d);
            }
        $scope.$digest();
        // }
    });

    $scope.webrtc.on('videoRemoved', function (video, peer) {
        console.log('video removed ', peer);
        if(peer.type == 'screen') {
            angular.element('.faculty-screen .videoContainer').remove();
            $scope.facultySharingScreen = false;
        }

        $scope.$digest();
    });
    $scope.webrtc.on('volumeChange', function (volume, treshold) {
        //console.log('own volume', volume);
        showVolume(document.getElementById('localVolume'), volume);
    });


    $scope.createRoom = function() {
        var newName = $scope.roomName.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
        $scope.webrtc.createRoom(newName, $scope.userName, function(err, name) {
            if (!err) {
                $scope.roomTitle = $scope.roomName;
                $scope.showLink = true;
                $scope.roomOwner = true;
                $scope.roomOwned = true;
                $scope.roomLink = $location.absUrl() + '?room=' + name;
                $routeParams.name = name;
                $scope.$digest();
            } else {
                console.log(err);
            }
        });
    };

    $scope.webrtc.on('localScreenStopped', function () {
        $scope.shareValue = 'Share My Screen';
    });

    $scope.shareScreen = function() {
        if ($scope.webrtc.getLocalScreen()) {
            $scope.shareValue = 'Share My Screen';
            $scope.webrtc.stopScreenShare();
        } else {
            $scope.shareValue = "Stop Sharing";
            $scope.webrtc.shareScreen(function (err) {
                if (err) {
                    console.log(err);
                }
            });
            
        }
    };

    $scope.facultyVideoClass = function() {
        if($scope.facultySharingScreen) {
            return 'plus-screen'
        }
        return '';
    };
});