const app = require('./index'); // import the Express app
const http = require("http");
const server = http.createServer(app);
const messageModel = require("./models/messages");
const { validateTokenWithoutExpress } = require("./services/authmiddleware");
const baseUrl = process.env.BASE_URL_FR_END;

const connectDB = require("./mongodb");

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true,
    },
});

// Websocket server events
io.on("connection", (socket) => {
    console.log("New client connected");

    // Join a specific board chatroom
    socket.on("joinBoard", (boardId) => {
        socket.join(boardId);
        console.log(`User joined board: ${boardId}`);
    });

    // Handle incoming chat messages
    socket.on("chatMessage", ({ boardId, accessToken, messageText }) => {
        validateTokenWithoutExpress(accessToken, (err, decodedToken) => {
            if (err) {
                return socket.emit("authError", err);
            }

            socket.user = {
                id: decodedToken.id,
                username: decodedToken.username,
            };

            console.log(
                "User Message sent: " + messageText + "; to board: " + boardId
            );

            const messageData = {
                boardId: boardId,
                userId: socket.user.id,
                username: socket.user.username,
                messageText: messageText,
                messageDate: new Date(),
            };

            // Save the message to the database
            const newMessage = new messageModel(messageData);
            newMessage
                .save()
                .then(() => {
                    //   io.to(boardId).emit('chatMessage', messageData);
                    io.to(boardId).emit("chatMessage", {
                        username: socket.user.username,
                        messageText,
                    });
                })
                .catch((error) => {
                    console.error("Error saving message to database:", error);
                });
        });
    });
});



connectDB()
    .then(() => {
        console.log("S0003 Connected to MongoDB");

        // *LAST* Server Basic GET Route: not-accessible when a static page is being served above.
        app.get("/", (req, res) => {
            res.json({
                message:
                    "Welcome to ProjecTile's Backend API Server. Good news: all is functional. ...Are you sure this is the app you're looking for?",
            }); //END: response
        }); //END: initial basic GET

        // Set and Listen on Port
        const port = process.env.PORT || 3001;
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("E0003 Database failed to connect: ", error);
        process.exit(1);
    });