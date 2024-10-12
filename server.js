if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mysql = require("mysql2");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const cron = require("node-cron");

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
  "SELECT songs.id, title, artist, songs.chart_id, category, image_file_name, lev_mas, lev_exp, lev_ult, piano, stamina, slide, tricky, crosshand, air, difficulty FROM songs LEFT JOIN radar ON songs.chart_id = radar.chart_id ORDER BY songs.id DESC LIMIT 18;";
const sqlInsert =
  "INSERT INTO radar (piano, stamina, slide, tricky, crosshand, air, chart_id, difficulty) VALUES (?)";
const sqlUpdate =
  "UPDATE radar SET piano = ?, stamina = ?, slide = ?, tricky = ?, crosshand = ?, air = ? WHERE chart_id = ? AND difficulty = ?";
const sqlExists =
  "SELECT EXISTS(SELECT 1 FROM radar WHERE chart_id = ? AND difficulty = ?)";
const sqlChartID = "SELECT chart_id FROM songs";

const songs = [];

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
      if (!existingSongs.includes(Number(song.id)) && song.id < 8000) {
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
  if (songs.length > 0) {
    connection.query(sql, [songs], function (err, result) {
      if (err) throw err;
      console.log(`Inserted ${result.affectedRows} songs.`);
    });
  } else {
    console.log("No new songs to insert");
  }
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
          attribute: false,
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
        attribute: false,
        admin: admin,
      });
    });
  }
});

app.get("/top/:attribute", (req, res) => {
  let admin;
  if (req.session.loggedin) {
    admin = true;
  } else {
    admin = false;
  }
  let attributeName = req.params.attribute;
  const sqlAttribute = `SELECT title, artist, songs.chart_id, category, image_file_name, lev_mas, lev_exp, lev_ult, piano, stamina, slide, tricky, crosshand, air, difficulty 
                     FROM songs 
                     LEFT JOIN radar ON songs.chart_id = radar.chart_id 
                     ORDER BY ${attributeName} DESC 
                     LIMIT 10`;
  console.log(attributeName);
  connection.query(sqlAttribute, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render("index", {
      result: result,
      searchOptions: attributeName,
      attribute: true,
      admin: admin,
    });
  });
});

app.get("/random", (req, res) => {
  const charts = [];
  connection.query(sqlChartID, function (err, result) {
    if (err) throw err;
    result.forEach((item) => {
      charts.push(item.chart_id);
    });
    const random = Math.floor(Math.random() * charts.length);
    // console.log(charts[random]);
    res.redirect(`/${charts[random]}#master`);
  });
});

app.post("/", (req, res) => {
  console.log("Request Body:", req.body);
  let username = req.body.uValue;
  let password = req.body.pValue;

  if (username && password) {
    connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      function (err, results) {
        console.log(results);
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length > 0) {
          req.session.loggedin = true;
          return res
            .status(200)
            .json({ message: "Login Successful Redirecting Now..." });
        } else {
          return res
            .status(401)
            .json({ message: "Invalid Username or Password" });
        }
      }
    );
  } else {
    res
      .status(400)
      .json({ message: "Please enter both username and password" });
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
  // error check for chart_id??
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

//use this function to manually update the songs db whenever a new batch of songs are added
//getData();

// cron schedule to run the getData function every thursday at 11am using the systems local time
cron.schedule("0 11 * * 4", getData);

app.listen(process.env.PORT || 3000);
