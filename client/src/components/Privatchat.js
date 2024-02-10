import { useEffect, useState } from "react";
import socket from "../Socket";

function Privatchat(props){
    const RoomData= props.RoomData;
    let[message,setMessage]=useState("");
    let[PrivatMessages,setPrivatMessages]=useState([]);
    
    let sendPrivatMessage=()=>{
        socket.emit("sendPrivatMessage",message,RoomData.Room,RoomData.Usermail2);
        setMessage("");
    }

    useEffect(()=>{
        socket.on("receive_Privat_message",(data)=>{
            setPrivatMessages((prev)=>([...prev,data]));
        })
    },[])

    return(
        <div className="privat_chat"> 
            <h3>{RoomData.Usermail2}</h3>
            <div className="messages">
                {PrivatMessages.map((data,Pidx)=>{
                    console.log(data.Usermail)
                     return(RoomData.Room===data.Room && (
                        <div key={Pidx} className={
                            data.Usermail === "server"
                            ? "message_server"
                            : data.Usermail === RoomData.Usermail2
                            ? "message_1"
                            : "message_2"
                        } >{data.message}</div>)
                    )
                })}
            </div>
            <div className="privat_input">
                <input
                    value={message}
                    placeholder="Message..."
                    onChange={(event)=>{setMessage(event.target.value)}}
                    onKeyDown={(event)=>{
                        event.key === "Enter" && sendPrivatMessage()
                    }}
                />
                <button onClick={sendPrivatMessage}>submit</button>
            </div>
        </div>
    )
}
export default Privatchat;