import mysql from "mysql2/promise";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

// Create the connection to database
const connection = await mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    port: process.env.portDatabase,
    waitForConnections: true,
});
const corsOptions ={
    origin:'*', 
    optionSuccessStatus:200,
 }
app.use(cors(corsOptions));

app.get("/", async (req, res) => {
    res.json({
        tables: "/query=SHOW TABLES",
        runQuery: "/query=<query>",
    });
});

process.on("SIGINT", () => {
    connection.end((err) => {
        if (err) {
            console.error("Error ending connection pool:", err);
            process.exit(1);
        }
        console.log("Connection pool closed");
        process.exit(0);
    });
});

app.get("/:query", async (req, res) => {
    if (req.params.query.slice(6) === "SHOW TABLES") {
        try {
            const [results, fields] = await connection.query(
                `${req.params.query.slice(6)}`
            );
            const Tables = [];
            results.forEach((item) => {
                const table = item[`Tables_in_${process.env.database}`];
                Tables.push(table);
            });
            res.type("application/json").send(Tables).status(200);
        } catch (err) {
            res.send(err);
        }
    } else {
        try {
            const [results, fields] = await connection.query(
                `${req.params.query.slice(6)}`
            );
            res.type("application/json").send(results).status(200);
        } catch (err) {
            res.send(err);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running in port: ${PORT} or http://localhost:${PORT}`);
});
