const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer();
const PORT = process.env.PORT || 3001;
const onlineUsers = {};
const typingUsers = [];
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

io.on("connection", async (socket) => {
    console.log("Usuário conectado: ", socket.id);

    socket.on("join_room", (customUserName) => {
        // Ao entrar na sala, atribua um nome de usuário
        const userName = customUserName || `Usuário${Object.keys(onlineUsers).length + 1}`;
        onlineUsers[socket.id] = userName;

        // Transmitir mensagem quando um usuário se conectar
        io.emit("chat-message", {
            user: "Sistema",
            msg: `${userName} se conectou ao chat.`,
            time: new Date(Date.now()).toLocaleTimeString(),
        });

        io.emit("update-online-users", Object.values(onlineUsers));
    });

    socket.on("typing", (userName) => {
        // Emitir evento para atualizar outros usuários
        io.emit("update-typing-users", [...typingUsers, userName]);
    });
    
    socket.on("stop-typing", (userName) => {
        // Remover usuário da lista de digitação
        const updatedTypingUsers = typingUsers.filter((user) => user !== userName);
        io.emit("update-typing-users", updatedTypingUsers);
    });

    io.emit("update-typing-users", typingUsers);

    socket.on("disconnect", () => {
        console.log("Usuário desconectado: ", socket.id);

        // Verificar se o usuário existe antes de emitir mensagens de desconexão
        if (onlineUsers[socket.id]) {
            io.emit("chat-message", {
                user: "Sistema",
                msg: `${onlineUsers[socket.id]} se desconectou do chat.`,
                time: new Date(Date.now()).toLocaleTimeString(),
            });

            delete onlineUsers[socket.id];
            io.emit("update-online-users", Object.values(onlineUsers));
        }
    });

    socket.on("send-message", (msg) => {
        console.log(msg, "MSG");
        io.emit("receive-msg", msg);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Socket.io server está rodando na porta ${PORT}`);
});
