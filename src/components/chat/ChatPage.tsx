"client component"

import { useConnection } from "@/context/connect";
import Image from "next/image"
import { useEffect, useState,useRef } from "react"
import io from "socket.io-client";


const socket = io("http://localhost:3001");

interface IMsgDatTypes {
    user: String;
    msg: String;
    time: String;
}

export default function ChatPage({ userName }: any){

    const [currentMsg, setCurrentMsg] = useState("");
    const [chatMessages, setChatMessages] = useState<IMsgDatTypes[]>([]);
    const { connection } = useConnection();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    
    
    async function sendMessage(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(currentMsg !== ""){
            const newMsg: IMsgDatTypes = {
                user: userName,
                msg: currentMsg,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            }

            connection.emit("send-message", newMsg);
            setCurrentMsg("");
        }
    }

    useEffect(()=>{
        if(connection){
            connection.on("receive-msg", (msg: IMsgDatTypes) => {
                setChatMessages((msgs) => [...msgs, msg]);
                scrollToBottom();
            });

            socket.on("update-online-users", (users) => {
                setOnlineUsers(users);
            });

            connection.on("chat-message", (msg: IMsgDatTypes) => {
                setChatMessages((msgs) => [...msgs, msg]);
                scrollToBottom();
            });
    
            return () => {
                // Desconectar o socket quando o componente for desmontado
                socket.disconnect();
            };
        }
    }, [connection]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    useEffect(() => {
        socket.on("update-typing-users", (users) => {
            const typingUsersString = users.join(', ');
            setIsTyping(typingUsersString);
        });
    }, [socket]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleTyping = () => {
        socket.emit("typing", userName);
    };
    
    const handleStopTyping = () => {
        socket.emit("stop-typing", userName);
    };

    
    const myOwnMessage = "flex flex-row-reverse bg-green-300";
    const otherUserMessage = "flex bg-gray-300";

    return(
        <div className="flex h-full ">
            {/* Barra Lateral */}
            <div className="flex flex-col w-[250px] h-screen bg-green-300 p-3 gap-6 border-green-600">
                <div className="w-[50%]">
                    <Image
                        src="/images/chatsz.png"
                        alt='Logo chat'
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-full"
                        priority
                    />
                </div>
                <div className="flex flex-col gap-2"> 
                    <span>Usuários online</span>
                    <ul>
                        {onlineUsers.map((user) => (
                            <li key={user}>{user}</li>
                        ))}  
                    </ul>
                </div>
            </div>
            
            {/* Chat principal */}
            <div className="h-[87%] w-[80%]">
                <div className="mb-2 flex flex-col w-full px-10 py-5 bg-white justify-between h-full overflow-scroll">
                    <div>
                        {chatMessages.map(({ user, msg, time }, key) => (
                            <div
                                key={key}
                                className={`mb-2 p-5 ${user === userName ? myOwnMessage : otherUserMessage} bg-green-300 text-black rounded-md`}
                            >
                                <div className="max-w-md">
                                    <div>
                                        <strong>{user}:</strong>
                                    </div>
                                    <div>{msg}</div>
                                    <div>{time}</div>
                                </div>
                            </div>
                        ))}
                        <div>
                            {isTyping && isTyping !== userName && <div>{isTyping} está digitando...</div>}  
                        </div>  
                        <div ref={messagesEndRef} />
                </div>
                <div className="absolute bottom-2 w-[80%] ">
                    <form onSubmit={sendMessage} className="flex gap-2 w-full justify-center">
                            <input type="text" className="rounded px-2 py-3 text-grey-700 border border-gray-400 w-2/3" placeholder="Digite sua mensagem" 
                            value={currentMsg} 
                            onChange={(e) => {
                                setCurrentMsg(e.target.value);
                                handleTyping();
                            }}
                            onBlur={handleStopTyping}
                            required
                        />
                        <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
            </div>
        </div>
    )
}