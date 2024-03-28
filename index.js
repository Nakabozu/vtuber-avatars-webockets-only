import express from "express";
import http from "http";
import { Server } from "socket.io";

import cors from "cors";
// import { readFileSync } from "fs";

const PORT = process.env.PORT || 3674;
const app = express();
app.use(cors());

const server = http.createServer(app);

console.log("Starting Express Server");

const usersEmotions = {
    Naka: "",
    Zuzu: "",
    Kuro: "",
    Ghost: "",
};

const isAllowedUser = (user) => {
    return Object.keys(usersEmotions).includes(user);
}

app.get('/', (req, res) => {
    res.write(`<h1>Socket IO Started on Port : ${PORT}</h1>`);
    res.end();
});

const io = new Server(server
        , {
        handlePreflightRequest: (req, res) => {
            const headers = {
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
                "Access-Control-Allow-Credentials": true
            };
            res.writeHead(200, headers);
            res.end();
        },
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }
);

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.emit("welcome", usersEmotions);

    socket.on("client_requests_emotions", (callback) =>{
        console.log(`Client wants to know all of the emotions`);
        return callback(usersEmotions);
    })

    socket.on("client_sets_emotion", (user, emotion, callback) => {
        if(isAllowedUser(user)){
            usersEmotions[user] = String(emotion);
            io.emit("server_updates_emotions", usersEmotions);
            callback(usersEmotions[user]);
            console.log(`${user} is now ${emotion}`)
        }else{
            socket.emit("nope");
        }
    });

    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
    })  
});

server.listen(PORT, () => {
    console.log(`Server is hosting your websockets at port ${PORT}`);
});    


