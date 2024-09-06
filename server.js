if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mysql = require("mysql2");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

// SQL queries
const sqlSearch =
  "SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, lev_exp, lev_ult, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id WHERE title REGEXP ? OR artist REGEXP ? ORDER BY chart_id;";
const sqlID =
  "SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, lev_exp, lev_ult, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id WHERE songs.chart_id = ?";
const sql =
  "INSERT INTO songs (chart_id, category, title, artist, lev_exp, lev_mas, image_file_name) VALUES ?";
const sqlRadar =
  "SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id ORDER BY chart_id DESC LIMIT 25;";
const sqlInsert =
  "INSERT INTO radar (piano, stamina, slide, tricky, crosshand, air, chart_id, difficulty) VALUES (?)";
const sqlUpdate =
  "UPDATE radar SET piano = ?, stamina = ?, slide = ?, tricky = ?, crosshand = ?, air = ? WHERE chart_id = ? AND difficulty = ?";
const sqlExists =
  "SELECT EXISTS(SELECT 1 FROM radar WHERE chart_id = ? AND difficulty = ?)";

// "SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, piano, stamina, slide, tricky, crosshand, air FROM songs LEFT JOIN radar ON songs.id = radar.chart_id ORDER BY chart_id DESC LIMIT 10;"
// "SELECT title, category, image_file_name, lev_mas, piano, stamina, slide, tricky, crosshand, air FROM songs INNER JOIN radar ON songs.id = radar.chart_id;"

let searchOptions;
const songs = [];

// static array for testing
const testArray = [
  [
    "2585",
    "POPS & ANIME",
    "カオスが極まる",
    "UNISON SQUARE GARDEN「ブルーロック」",
    "10",
    "13",
    "b77408768afa58d4.jpg",
  ],
  ["2586", "POPS & ANIME", "唱", "Ado", "8", "12+", "2274030518738fc8.jpg"],
];

// MySQL connection config
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DATABASE_PASSWORD,
  database: "chuni_radar",
});

// connect to the MySQL DB
connection.connect((error) => {
  if (error) {
    console.error("error connecting to MySQL database:", error);
  } else {
    console.log("connected to MySQL database");
  }
});

// query the MySQL DB
function querySongs() {
  connection.query("SELECT * FROM songs", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
}

// testing how to insert data from array into MySQL DB
function insertFromArray() {
  connection.query(sql, [songs], function (err) {
    if (err) throw err;
  });
}

// pull data from chunithm music.json
// push desired data into songs array
// run SQL query to insert all data from songs array into MySQL DB
// add function here to query all songs, store the chart id's in an array, add if to check if chart id is in the array, if so skip. ideally this will only insert unqiue songs automatically
async function getData() {
  const url = "https://chunithm.sega.jp/storage/json/music.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    json.forEach((song) => {
      if (song.id < 8000) {
        songs.push([
          song.id,
          song.catname,
          song.title,
          song.artist,
          song.lev_exp,
          song.lev_mas,
          song.image,
        ]);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
  connection.query(sql, [songs], function (err, result) {
    if (err) throw err;
    console.log(result);
  });
}

// index route, handles landing page and user search results
app.get("/", async (req, res) => {
  if (req.query.search != null && req.query.search != "") {
    const searchOptions = req.query.search;
    connection.query(
      sqlSearch,
      [searchOptions, searchOptions],
      function (err, result) {
        if (err) throw err;
        res.render("index", { result: result, searchOptions: searchOptions });
      }
    );
  } else {
    connection.query(sqlRadar, function (err, result) {
      if (err) throw err;
      res.render("index", { result: result, searchOptions: null });
    });
  }
});

app.get("/:id", (req, res) => {
  // add undefined/null/empty check for req.params.id ?
  const chart_id = req.params.id;
  connection.query(sqlID, `${chart_id}`, function (err, result) {
    if (err) throw err;
    res.render("song", { result: result });
  });
});

app.post("/:id", (req, res) => {
  const chart_id = req.params.id;
  const piano = req.body.pianoSelect;
  const stamina = req.body.staminaSelect;
  const slide = req.body.slideSelect;
  const tricky = req.body.trickySelect;
  const crosshand = req.body.crosshandSelect;
  const air = req.body.airSelect;
  const difficulty = req.body.difficultySelect;

  const values = [
    piano,
    stamina,
    slide,
    tricky,
    crosshand,
    air,
    chart_id,
    difficulty,
  ];

  connection.query(sqlExists, [chart_id, difficulty], function (err, result) {
    if (err) throw err;
    const exists = Object.values(result[0])[0];

    if (exists === 0) {
      connection.query(sqlInsert, [values], function (err, result) {
        if (err) throw err;
        res.redirect(`${chart_id}#${difficulty}`);
      });
    } else if (exists === 1) {
      connection.query(
        sqlUpdate,
        [piano, stamina, slide, tricky, crosshand, air, chart_id, difficulty],
        function (err, result) {
          if (err) throw err;
          res.redirect(`${chart_id}#${difficulty}`);
        }
      );
    }
  });
});

app.listen(process.env.PORT || 3000);
