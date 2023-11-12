"client component"

import { useConnection } from "@/context/connect";
import Image from "next/image"
import { useEffect, useState } from "react"

interface IMsgDatTypes {
    user: String;
    msg: String;
    time: String;
}

export default function ChatPage({ userName }: any){

    const [currentMsg, setCurrentMsg] = useState("");
    const [chatMessages, setChatMessages] = useState<IMsgDatTypes[]>([]);
    const { connection } = useConnection();
    
    
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
            })
        }
    }, [connection]);


    return(
        <div className="flex ">
            {/* Barra Lateral */}
            <div className="flex flex-col w-96 h-screen bg-green-300 p-3 gap-6 border-green-600">
                <div className="w-2/3">
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
                    <span>{userName}</span>
                </div>
            </div>
            
            {/* Chat principal */}
            <div className="flex flex-col w-full h-screen px-10 py-5 bg-yellow-100 justify-between">
                <div>
                    {
                        chatMessages.map(({user, msg, time}, key) => (
                            <div key={key} className="p-5">
                                <div>{user}:</div>
                                <div>{msg}</div>
                                <div>{time}</div>
                            </div>
                        )
                        )
                    }
                </div>
                <div>
                    <form onSubmit={sendMessage} className="flex gap-2 w-full justify-center">
                            <input type="text" className="rounded px-2 py-3 text-grey-700 border border-gray-400 w-2/3" placeholder="Digite sua mensagem" 
                            value={currentMsg} 
                            onChange={(e)=>setCurrentMsg(e.target.value)} 
                            required
                        />
                        <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}