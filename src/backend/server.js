const http = require ("http")
const { Server } = require("socket.io")

const httpServer = http.createServer();

const PORT = process.env.PORT || 3001

const onlineUsers = {};

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});


io.on("connection", async (socket) => {
    console.log("Usuário conectado: ", socket.id);
    socket.on("join_room", (userName)=>{
        console.log(`Username: ${userName} - Socket.id: ${socket.id}`);
        onlineUsers[socket.id] = userName;
        io.emit("update-online-users", Object.values(onlineUsers));
    });

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];

        io.emit("update-online-users", Object.values(onlineUsers));
    });


    socket.on("send-message", (msg)=>{
        console.log(msg, "MSG");
        io.emit("receive-msg", msg);
    });

});


httpServer.listen(PORT, ()=>{
    console.log(`Socket.io server esta rodando na porta ${PORT}`);
})