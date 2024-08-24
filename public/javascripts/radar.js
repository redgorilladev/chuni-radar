const canvasCollection = document.querySelectorAll("canvas");

let x = [];
let y = [];

const coords = [
  // piano
  {
    x: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    y: [93, 82.6667, 72.3333, 62, 51.6667, 41.3333, 31, 20.6667, 10.3333, 0],
  },
  // stamina
  {
    x: [
      105, 115.5556, 126.1111, 136.6667, 147.2222, 157.7778, 168.3333, 178.8889,
      189.4444, 200,
    ],
    y: [
      95, 89.2222, 83.4444, 77.6667, 71.8889, 66.1111, 60.3333, 54.5556,
      48.7778, 43,
    ],
  },
  // slide
  {
    x: [
      105, 115.5556, 126.1111, 136.6667, 147.2222, 157.7778, 168.3333, 178.8889,
      189.4444, 200,
    ],
    y: [
      103, 109.1111, 115.2222, 121.3333, 127.4444, 133.5556, 139.6667, 145.7778,
      151.8889, 158,
    ],
  },
  // tricky
  {
    x: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    y: [
      105, 115.5556, 126.1111, 136.6667, 147.2222, 157.7778, 168.3333, 178.8889,
      189.4444, 200,
    ],
  },
  // cross hand
  {
    x: [
      94, 83.5556, 73.1111, 62.6667, 52.2222, 41.7778, 31.3333, 20.8889,
      10.4444, 0,
    ],
    y: [102, 108, 114, 120, 126, 132, 138, 144, 150, 156],
  },
  // air
  {
    x: [
      94, 83.5556, 73.1111, 62.6667, 52.2222, 41.7778, 31.3333, 20.8889,
      10.4444, 0,
    ],
    y: [96, 90, 84, 78, 72, 66, 60, 54, 48, 42],
  },
];

const defaultCoords = [
  { x: 100, y: 93 },
  { x: 105, y: 95 },
  { x: 105, y: 103 },
  { x: 100, y: 105 },
  { x: 94, y: 102 },
  { x: 94, y: 96 },
];

canvasCollection.forEach((canvas) => {
  if (canvas.dataset.pianovalue) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    // move to piano value
    ctx.moveTo(
      coords[0].x[canvas.dataset.pianovalue],
      coords[0].y[canvas.dataset.pianovalue]
    );
    ctx.lineTo(
      coords[1].x[canvas.dataset.staminavalue],
      coords[1].y[canvas.dataset.staminavalue]
    );
    ctx.lineTo(
      coords[2].x[canvas.dataset.slidevalue],
      coords[2].y[canvas.dataset.slidevalue]
    );
    ctx.lineTo(
      coords[3].x[canvas.dataset.trickyvalue],
      coords[3].y[canvas.dataset.trickyvalue]
    );
    ctx.lineTo(
      coords[4].x[canvas.dataset.crosshandvalue],
      coords[4].y[canvas.dataset.crosshandvalue]
    );
    ctx.lineTo(
      coords[5].x[canvas.dataset.airvalue],
      coords[5].y[canvas.dataset.airvalue]
    );
    //coords.forEach((coord) => {
    // draw a line from piano value to each other value
    // ctx.lineTo(coord.x[7], coord.y[7]);
    //});
    ctx.closePath();
    ctx.stroke();
    const grad = ctx.createRadialGradient(100, 100, 40, 100, 100, 110);
    grad.addColorStop(0, "blue");
    grad.addColorStop(1, "red");
    ctx.fillStyle = grad;
    ctx.fill();
    canvas.classList.add("animate-radar");
  } else {
    const ctx = canvas.getContext("2d");
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set styles for the question mark
    ctx.fillStyle = "white"; // Color of the question mark
    ctx.font = "bold 120px Arial"; // Font size and style
    ctx.textAlign = "center"; // Center align horizontally
    ctx.textBaseline = "middle"; // Center align vertically
    // Calculate position to center the text
    const x = canvas.width / 2;
    const y = canvas.height / 2; // 2 is centered on mobile, + 10 centered on pc. not sure why

    // Draw the question mark
    ctx.fillText("?", x, y);
    canvas.classList.add("animate-radar");
  }
});

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(x[0], y[0]);

  x.forEach((xValue, index) => {
    ctx.lineTo(xValue, y[index]);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "purple";
  ctx.fill();
}

function drawMaxChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(coords[0].x[4], coords[0].y[4]);

  coords.forEach((coord) => {
    ctx.lineTo(coord.x[4], coord.y[4]);
  });

  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "purple";
  ctx.fill();
}

function drawDefaultChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(defaultCoords[0].x, defaultCoords[0].y);

  defaultCoords.forEach((coord) => {
    ctx.lineTo(coord.x, coord.y);
  });

  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "purple";
  ctx.fill();
}
