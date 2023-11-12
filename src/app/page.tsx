"use client"

import ChatPage from '@/components/chat/ChatPage';
import { useConnection } from '@/context/connect';
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {

  const [showSpinner, setShowSpinner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");


  const { connection } = useConnection();

  function handleJoin(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    // Logica entrar 
    if(userName !== ""){
      connection.emit("join_room", userName);
      setShowSpinner(true);
      setTimeout(()=>{
        setShowChat(true);
        setShowSpinner(false);
      }, 500);
    } 


    setShowChat(true);
  }

  return (
    <main className="flex h-screen w-screen overflow-x-hidden">
        <div className="flex flex-col w-full h-full justify-center items-center gap-2" style={{display: showChat ? "none " : "" }}>
          <div className="w-1/5">
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
          <div>
            <form onSubmit={handleJoin} className="flex gap-2">
              <input type="text" className="rounded px-2 py-3 text-grey-700 border border-gray-400" placeholder="Digite o seu usuário" value={userName} onChange={(e)=>setUserName(e.target.value)} required/>
              <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800">
                {
                  !showSpinner ? ("Entrar") : (
                    <div className="border-4 border-solid border-t-4 border-[#21f379] rounded-lg w-5 h-5 animate-spin"></div>
                  )
                }
              </button>
            </form>
          </div>
        </div> 
        <div className="w-full" style={{display: showChat ? "" : "none" }}>
          <ChatPage userName={userName}/>
        </div>
    </main>
  )
}
