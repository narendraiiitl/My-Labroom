const preload = document.getElementById("prewrapper");
const attend=document.getElementById('lpresence');
const Sub=document.getElementById('lsubject');
let currentsubject;
$.ajax({
  url: 'http://localhost:3000/api/currentsubject',
  type: 'GET',
  dataType: 'json',
  beforeSend: setHeader
})
.then(showsubject)
.catch(function(err){
  console.log(err)
})
function setHeader(xhr) {
xhr.setRequestHeader('subject_id', ROOM_ID);
}
function showsubject(subject) {
  currentsubject=subject;
  Sub.innerText = subject.name
}
window.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    preload.style.display = "none";
    preload.style.zIndex = -1;
    document.getElementsByTagName("body")[0].style.background = "#232323";
  },2000);
});
  const socket = io("/");
  const peers = {};
  const token = $.cookie("user_id");
  const myPeer = new Peer(token);
  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  myVideo.muted = true;
  myVideo.width = "300";
  myVideo.height = "300";
  myVideo.controls = true;
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream);

      myPeer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });

      socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
      });
    });

  socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
  });

  myPeer.on("open", (id) => {
    console.log(id);
    socket.emit("join-room", ROOM_ID, id);
  });

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    peers[userId] = call;
  }

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGrid.append(video);
  }

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]).then(async () => {
    startVideo();
  });
let p=0;
  async function startVideo() {
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    const displaySize = { width: myVideo.width, height: myVideo.height };
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(myVideo, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      if (resizedDetections.length) {
        const result = resizedDetections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor)
        );
        if (result[0].label == "narendra")
        {
          p=p+1;
          if (p == 20) {
            // console.log(result[0].label);
            attend.innerText = 'PRESENT'
         axios({
              method: 'post',
              url: 'http://localhost:3000/api/markattendence',
              data: {  id:token,
                  subject:currentsubject,
              },
              headers: {'Content-Type': 'application/json;charset=utf-8','authorization':`Bearer ${token}` }
          })
          .then(function (response) {
            attend.innerText = 'PRESENT'
          })
          .catch(function (error) {
            attend.innerText = 'PENDING'
          });
          }
        }
      }
    }, 100);
  }

  function loadLabeledImages() {
    const labels = ["narendra"];
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        const img = await faceapi.fetchImage(
          `https://media-exp1.licdn.com/dms/image/C4E03AQEjeflD2KZJ2Q/profile-displayphoto-shrink_400_400/0?e=1603929600&v=beta&t=RAWxiMMc_Vr8HdZt4ruXZejvvWHIutrZOR-h4eEVuLs`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }





  $.ajax({
  url: 'http://localhost:3000/api/username',
  type: 'GET',
  dataType: 'json',
  beforeSend: setHeaderforusername
})
.then(showuser)
.catch(function(err){
  console.log(err)
})
function setHeaderforusername(xhr) {
xhr.setRequestHeader('user_id', token);
}
const uname=document.getElementById('lusername');
function showuser(user) {
  console.log(user);
  console.log(user.username);
  uname.innerText = user.username
}
