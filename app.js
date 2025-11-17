import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import compression from "compression";
// import path from "path";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middleware/error.js";
import { syncAllTables } from "./syncAllTables/syncAllTables.js";
import userRouter from "./router/user.router.js";
import adminRouter from "./router/admin.router.js";
import vendorRouter from "./router/vendor.router.js";
import { Server } from "socket.io"; 

// __dirname support in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

dotenv.config({ path: ".env" });

app.use(
  cors({
    origin: process.env.FRONTEND,
    methods: ["GET", "PUT", "DELETE", "POST", "PATCH"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use('/assets', express.static('assets'));


app.use(
  session({
    secret: "dhfhheewwqqh84883ddnewead", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//routes 
app.get("/test", function (req, res) {
  res.send("Working Api on this server cors!");
});

// messages socket io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join user room
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // send message realtime
  socket.on("send_message", (data) => {
    const { sender_id, receiver_id, message } = data;

    // send to receiver only
    io.to(receiver_id).emit("receive_message", {
      sender_id,
      receiver_id,
      message,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


app.get("/api/syncAllTables", syncAllTables);
app.use("/api/v1/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/vendor", vendorRouter);

dbConnection();
app.use(errorMiddleware);

// server.listen(process.env.PORT || 8000, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

export default app; 
export { server };
