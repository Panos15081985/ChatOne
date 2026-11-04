import { useState , useEffect} from "react";
import { useLocation, Navigate } from "react-router-dom";
import socket from "../Socket";
import Privatchat from "./Privatchat";
import Answer from "./Answer";

const pad=(n)=>String(n).padStart(2,"0");

const formatDate=(date)=>
    `${pad(date.getHours())}:${pad(date.getMinutes())}  ` +
    `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

function Chatpage(){
    const location=useLocation();
    const mail = location.state?.mail;
    const userId = location.state?.userId;
    let[list,setlist]=useState([]);
    let[message,setMessage]=useState("");
    const room="10";
    let[users,setusers]=useState([]);
    let[Rooms_List,setRooms_List]=useState([]);
    let[Answer_List,setAnswer_List]=useState([]);
    let[PrivatChat,setPrivatChat]=useState(false);

    useEffect(() => {
        if(mail) socket.emit("email_send",room,mail);
    }, [mail]);

    let sendMessage=()=>{
        if(message!==""){
            const MData={
                room: room,
                userId:userId,
                MyEmail: mail,
                message:message,
                Date: formatDate(new Date()),
            }
            socket.emit("send_message",MData);
            setMessage("");
        }
    }

    let privat_message=(conversationalist)=>{
        let userExist = Rooms_List.some(room => room.Usermail2 === conversationalist);
        if(conversationalist!==mail && !userExist){
            const randomRoom = Math.floor(Math.random() * (5000 - 20 + 1)) + 20;
            setRooms_List((prev)=>([...prev,{Room:randomRoom, Usermail1:mail, Usermail2:conversationalist}]));
            setPrivatChat(true);
            socket.emit("PrivatMsg",conversationalist,randomRoom,mail);
        }
        else alert("You can't chat with yourself or with a person who is already chatting");
    }

    let delete_Privat_Chat=(RoomData)=>{
       let NewRooms=Rooms_List.filter(User=>User.Room!==RoomData.Room);
       let newAnswerlist= Answer_List.filter(answ => answ.Usermail2 !== RoomData.Usermail2);
       setAnswer_List(newAnswerlist);
       setRooms_List(NewRooms);
       socket.emit("leave_Join",RoomData);
       socket.emit("Answer_delete",RoomData);
    }

    useEffect(()=>{
        // A partner left (or disconnected): remove their requests and rooms
        const removePartner=(partnerMail)=>{
            setAnswer_List((prev)=>prev.filter(answ => answ.Usermail2 !== partnerMail));
            setRooms_List((prev)=>prev.filter(r => r.Usermail2 !== partnerMail));
        }

        const onMessage=(data)=>{
            setlist((prev)=>([...prev,data]));
        }

        const onUsers=(data)=>{
            setusers(data);
        }

        const onPrivatRoom=(randomRoom,partnerMail,myMail)=>{
            if(randomRoom==="server"){
                removePartner(partnerMail);
                return;
            }
            const request={Room:randomRoom, Usermail1:myMail, Usermail2:partnerMail};
            setAnswer_List((prev)=>
                prev.some(ans => ans.Usermail2===partnerMail) ? prev : [...prev,request]
            );
            setRooms_List((prev)=>([...prev,request]));
        }

        const onDisconnectName=(disconnectName)=>{
            removePartner(disconnectName);
        }

        socket.on("receive_message",onMessage);
        socket.on("users",onUsers);
        socket.on("Privat_room",onPrivatRoom);
        socket.on("disconnectname",onDisconnectName);

        return ()=>{
            socket.off("receive_message",onMessage);
            socket.off("users",onUsers);
            socket.off("Privat_room",onPrivatRoom);
            socket.off("disconnectname",onDisconnectName);
        }
    },[])

    if(!mail){
        return <Navigate to="/" replace />;
    }
  
    return(
        <div className="chat_one">
            <div className="logo">
                <h1>Chat-One</h1>
            </div>
            <div className="chat_up">
                <div className="zentral_chat">
                    <div className="zentral_1">
                        <div className="zentral_messages">
                            {list.map((msg,midx)=>{
                                return(
                                    <div key={midx} className="allMsg">
                                        <div className="datenUser">
                                            <div className="Dmail">{msg.MyEmail}</div>
                                            <div className="Ddate">{msg.Date}</div>
                                        </div>
                                        <div className="msg">{msg.message}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="zentral_input">
                            <input
                                value={message}
                                placeholder="Message..."
                                onChange={(event)=>{setMessage(event.target.value)}}
                                onKeyDown={(event)=>{
                                    event.key === "Enter" && sendMessage()
                                }}
                            />
                            <button onClick={sendMessage}>submit</button>
                        </div>
                    </div>
                    <div className="zentral_2">
                        <div className="users">
                            {users.map((user,uidx)=>{
                                return(
                                    <div className={user===mail ? "user1" :"user"}  key={uidx} onClick={()=>{privat_message(user)}}>{user}</div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="chat_down">
                <div  className="Answer_zentrale_div">
                    {Answer_List.map((AnswerUser)=>{
                        return(
                            <div key={AnswerUser.Room}>
                                <Answer
                                    AnswerUser={AnswerUser} 
                                    Rooms_List={Rooms_List}
                                    setRooms_List={setRooms_List}
                                    setPrivatChat={setPrivatChat}
                                    Answer_List={Answer_List}
                                    setAnswer_List={setAnswer_List}
                                />
                            </div>
                        )
                    })} 
                 </div>          
                <div className="privat_chat_rooms">
                    {PrivatChat && Rooms_List.map((RoomData)=>{
                        return(
                            <div key={RoomData.Room} className="privat_room">
                                <div className="privat_delete" onClick={()=>{delete_Privat_Chat(RoomData)}}>X</div>
                                <Privatchat RoomData={RoomData}/>
                            </div>
                    )
                })}
                </div>
            </div>
        </div>
    )
}
export default Chatpage;