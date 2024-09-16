if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mysql = require("mysql2");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());

// SQL queries
const sqlSearch =
  "SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, lev_exp, lev_ult, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id WHERE title REGEXP ? OR artist REGEXP ? ORDER BY chart_id;";
const sqlID =
  "SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, lev_exp, lev_ult, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id WHERE songs.chart_id = ?";
const sql =
  "INSERT INTO songs (chart_id, category, title, artist, lev_exp, lev_mas, image_file_name) VALUES ?";
const sqlRadar =
  "SELECT songs.id, title, artist, songs.chart_id, category, image_file_name, lev_mas, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id ORDER BY songs.id DESC LIMIT 18;";
const sqlInsert =
  "INSERT INTO radar (piano, stamina, slide, tricky, crosshand, air, chart_id, difficulty) VALUES (?)";
const sqlUpdate =
  "UPDATE radar SET piano = ?, stamina = ?, slide = ?, tricky = ?, crosshand = ?, air = ? WHERE chart_id = ? AND difficulty = ?";
const sqlExists =
  "SELECT EXISTS(SELECT 1 FROM radar WHERE chart_id = ? AND difficulty = ?)";
const sqlChartID = "SELECT chart_id FROM songs";

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

// query db for existing songs and store them in an array
// pull data from chunithm music.json
// if the song doesnt already exist in our db then push desired data into songs array
// run SQL query to insert all data from songs array into MySQL DB
async function getData() {
  const existingSongs = [];
  connection.query(sqlChartID, function (err, result) {
    if (err) throw err;
    result.forEach((item) => {
      existingSongs.push(item.chart_id);
    });
  });

  const url = "https://chunithm.sega.jp/storage/json/music.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    json.forEach((song) => {
      if (existingSongs.includes(Number(song.id))) {
        return;
      }
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
  //use this log to check which songs are going to be inserted, they should not already exist in the db
  console.log(songs);

  // insert the new songs into the db
  connection.query(sql, [songs], function (err, result) {
    if (err) throw err;
    console.log(result);
  });
}

// index route, handles landing page and user search results
app.get("/", (req, res) => {
  console.log(req.session);
  let admin;
  if (req.session.loggedin) {
    admin = true;
  } else {
    admin = false;
  }

  if (req.query.search != null && req.query.search != "") {
    const searchOptions = req.query.search;
    connection.query(
      sqlSearch,
      [searchOptions, searchOptions],
      function (err, result) {
        if (err) throw err;
        res.render("index", {
          result: result,
          searchOptions: searchOptions,
          admin: admin,
        });
      }
    );
  } else {
    connection.query(sqlRadar, function (err, result) {
      if (err) throw err;
      res.render("index", {
        result: result,
        searchOptions: null,
        admin: admin,
      });
    });
  }
});

app.post("/", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      function (err, results) {
        if (err) throw err;

        if (results.length > 0) {
          req.session.loggedin = true;
          res.redirect("/");
        } else {
          res.send("incorrect username or password");
        }
      }
    );
  }
});

app.get("/logout", (req, res) => {
  console.log("before destroy:", req.session);
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    console.log("after destroy:", req.session);
    res.redirect("/");
  });
});

app.get("/:id", (req, res) => {
  // add undefined/null/empty check for req.params.id ?
  const chart_id = req.params.id;
  let admin;
  if (req.session.loggedin) {
    admin = true;
  } else {
    admin = false;
  }
  connection.query(sqlID, `${chart_id}`, function (err, result) {
    if (err) throw err;
    res.render("song", { result: result, admin: admin });
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

//use this function to update the songs db whenever a new batch of songs are added
//getData();

app.listen(process.env.PORT || 3000);
