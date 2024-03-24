import express from "express";
import cors from "cors";
import https from "https";
import { Server } from "socket.io";
import { readFileSync } from "fs";

const PORT = process.env.PORT || 5674;
const app = express();
app.use(cors());

const server = https.createServer(app);

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

const io = new Server(server, {
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
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("client_requests_emotions", (callback) =>{
        console.log(`Client wants to know all of the emotions`);
        return callback(usersEmotions);
    })

    socket.on("client_sets_emotion", (user, emotion) => {
        if(isAllowedUser(user)){
            usersEmotions[user] = String(emotion);
            io.emit("server_updates_emotions", usersEmotions);
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
    console.log(`Server is hosting your websockets`);
});    
