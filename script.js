let counter = 0;
const playButton = document.getElementById("play");
const forwardButton = document.getElementById("forward");
const reverseButton = document.getElementById("reverse");
const player = document.querySelector("audio");
const knob = document.querySelector(".volume-knob");
const knobSlider = document.querySelector(".volume-rail");

function dragstart_handler(ev) {
  // ev.preventDefault();
  ev.dataTransfer.setData("text/html", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
  console.log("holding");
}

function dragover_handler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function drop_handler(ev) {
  console.log(volumeData(ev));
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/html", ev.target.id);
  ev.target.appendChild(knob);
  let volume = volumeData(ev);
  knob.style.top = volume.position + "px";
  player.volume = (volume.height - volume.position) / volume.height;
  console.log("dropping");
}

function dragstart_handler2(ev) {
  // ev.preventDefault();
  ev.dataTransfer.setData("text/html", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
  console.log("holding 2");
}

function dragover_handler2(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function drop_handler2(ev) {
  console.log(audioPosition(ev));
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/html", ev.target.id);
  ev.target.appendChild(document.getElementById("progress-pin"));
  let position = audioPosition(ev);
  document.getElementById("progress-pin").style.left = position + "px";
  player.currentTime = player.duration * (position.position / position.width);
  console.log("dropping 2");
}

function trackForward() {
  counter++;
  return playFile();
}

function trackReverse() {
  counter--;
  return playFile();
}

async function progress() {
  const runTime = player.duration;
  let value;
  let progressBar = document.getElementById("progress-bar");
  let progressPin = document.getElementById("progress-pin");
  progressBar.style.width = 100 + "%";
  if (player.currentTime > 0) {
    value = Math.floor((100 / player.duration) * player.currentTime);
  }
  if (player.currentTime >= player.duration) {
    counter++;
    await playFile();
  }
  // progressBar.style.width = value + "%";
  progressPin.style.left = 0 + "px";
  progressPin.style.left = value + "%";
}

async function playFile() {
  player.currentTime = 0;
  console.log("playing");
  playButton.removeEventListener("click", playFile);
  playButton.addEventListener("click", stopFile);
  await fetch("./tracks.json")
    .then((response) => response.json())
    .then((data) => {
      if (counter < 0) {
        counter = 0;
        player.currentTime = 0;
        document.getElementById("error").innerText = "This is the first track";
        throw new Error("first track");
      }
      if (counter >= data.length) {
        counter = data.length - 1;
        document.getElementById("error").innerText = "This is the last track";
        throw new Error("last Track");
      }
      if (counter >= data.length && player.currentTime === player.duration) {
        playButton.name = "play-outline";
        counter = 0;
        return stopFile();
      }
      document.getElementById("player").src = data[counter].src;
      document.getElementById("track-title").innerHTML = `
        <strong>Artist: </strong> <span>${data[counter].artist}</span>
        <strong>Title: </strong> <span>${data[counter].title}</span>
        <strong>Track &#35;: </strong> <span>${counter + 1}</span>`;
      document.getElementById("error").innerText = "";
      playButton.name = "pause-outline";
      return data;
    });
}

function stopFile() {
  console.log("stopped");
  playButton.name = `play-outline`;
  player.src = "";
  playButton.removeEventListener("click", stopFile);
  playButton.addEventListener("click", playFile);
}

let volumeData = function (e) {
  let y = e.offsetY;
  let height = knobSlider.getBoundingClientRect().height;
  console.log(`Y: ${y} Height: ${height}`);
  return {
    position: y,
    height: height,
  };
};

let audioPosition = function (e) {
  let progressBar = document.getElementById("progress-bar");
  let x = e.offsetX;
  let width = progressBar.getBoundingClientRect().width;
  return {
    position: x,
    width: width,
  };
};

playButton.addEventListener("click", playFile);
forwardButton.addEventListener("click", trackForward);
reverseButton.addEventListener("click", trackReverse);
player.addEventListener("timeupdate", progress, false);
knob.addEventListener("dragstart", dragstart_handler);
let volume = knobSlider.addEventListener("mouseover", volumeData);
knobSlider.addEventListener("click", (e) => {
  let y = e.offsetY;
  let height = knobSlider.getBoundingClientRect().height;
  console.log(`Y: ${y} Height: ${height}`);
  e.preventDefault();
  e.target.appendChild(knob);
  knob.style.top = y + "px";
  player.volume = (height - y) / height;
  console.log("dropping");
});

document.getElementById("progress-bar").addEventListener("click", (e) => {
  let x = e.offsetX;
  let width = e.target.getBoundingClientRect().width;
  document.getElementById("progress-pin").style.left = x + "px";
  player.currentTime = player.duration * (x / width);
});
