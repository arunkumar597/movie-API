const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
let db = null;

const dbPath = path.join(__dirname, "moviesData.db");
const intializeDbandserver = async () => {
    try {
        db = await open({ filename: dbPath, driver: sqlite3.Database });
        app.listen(3000, () => {
            console.log("server is Up and Running");
        });
    } catch (e) {
        console.log(`${e.message}`);
    }
};

intializeDbandserver();

// API one
app.get("/movies/", async (req, res) => {
    let sqlQuery = `SELECT * FROM movie;`;
    let result = await db.all(sqlQuery);
    const movieNameResult = (obj) => {
        return {
            movieName: obj.movie_name,
        };
    };
    //   console.log(result.map((result) => movieName(result)));
    let resArray = result.map((resultArray) => movieNameResult(resultArray));
    res.send(resArray);
});

// API Two
app.post("/movies/", async (req, res) => {
    try {
        const requestBody = req.body;
        const { directorId, movieName, leadActor } = requestBody;
        const sqlQuery = `INSERT INTO movie(director_id, movie_name, lead_actor)
            VALUES ('${directorId}', '${movieName}', '${leadActor}');`;
        let result = await db.run(sqlQuery);
        let movie_id = result.lastID;
        console.log(result);
        res.send("Movie Successfully Added");
    } catch (e) {
        console.log(`${e.message}`);
    }
});


// API Three
app.get("/movies/:movieId/", async (req, res) => {
    try {
        const { movieId } = req.params;
        const sqlQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
        console.log(sqlQuery);
        const result = await db.get(sqlQuery);
        const oneMovie = (obj) => {
            return {
                movieId: obj.movie_id,
                directorId: obj.director_id,
                movieName: obj.movie_name,
                leadActor: obj.lead_actor,
            };
        };
        console.log(result);
        res.send(oneMovie(result));
    } catch (e) {
        console.log(`${e.message}`);
    }
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
    const { movieId } = request.params;
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const sqlQuery = `
    UPDATE
      movie
    SET
     director_id = '${directorId}',
     movie_name = '${movieName}',
     lead_actor = '${leadActor}';`;
    await db.run(sqlQuery);
    response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId/", async (req, res) => {
    const { movieId } = req.params;
    const sqlQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
    await db.run(sqlQuery);
    res.send("Movie Removed");
});

// API Six
app.get("/directors/", async (req, res) => {
    let sqlQuery = `SELECT * FROM director;`;
    let result = await db.all(sqlQuery);
    const directorName = (obj) => {
        return {
            directorId: obj.director_id,
            directorName: obj.director_name,
        };
    };
    //   console.log(result.map((result) => directorName(result)));
    res.send(result.map((result) => directorName(result)));
});

// API Seven
app.get("/directors/:directorId/movies/", async (req, res) => {
    const { directorId } = req.params;
    const sqlQuery = `SELECT * FROM movie WHERE director_id = ${directorId};`;
    let resultFinal = await db.all(sqlQuery);
    const movieNameOnly = (obj) => {
        return {
            movieName: obj.movie_name,
        };
    };
    let finalArray = resultFinal.map((result) => movieNameOnly(result));
    res.send(finalArray);
});

module.exports = app;
