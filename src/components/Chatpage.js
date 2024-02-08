import { useState , useEffect} from "react";
import { useLocation } from "react-router-dom";
import socket from "../Socket";
import Privatchat from "./Privatchat";
import Answer from "./Answer";

function Chatpage(){
    const location=useLocation();
    const mail = location.state.mail;
    const userId = location.state.userId;
    let[list,setlist]=useState([]);
    let[message,setMessage]=useState("");
    let[room,setRoom]=useState("10");
    let[users,setusers]=useState([]);
    let[Rooms_List,setRooms_List]=useState([]);
    let[Answer_List,setAnswer_List]=useState([]);
    let[PrivatChat,setPrivatChat]=useState(false);
    let[AnswerEmail,setAnswerEmail]=useState("");

    useEffect(() => {
        socket.emit("email_send","10",mail);
    }, [mail]);

    let sendMessage=()=>{
        if(message!==""){
            const MData={
                room: room,
                userId:userId,
                MyEmail: mail,
                message:message,
                Date: `${new Date(Date.now()).getHours()}:${new Date(Date.now()).getMinutes()}  ` +
                `${new Date(Date.now()).getDate()}-${new Date(Date.now()).getMonth() + 1}-${new Date(Date.now()).getFullYear()}`,
            }
            socket.emit("send_message",MData);
            setMessage("");
        }
    }

    let privat_message=(event)=>{
        let conversationalist=event.target.innerHTML;
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
        socket.on("receive_message",(data)=>{
            setlist((prev)=>([...prev,data]));
        })
    
        socket.on("users",(data)=>{
            setusers(data);
        })
        
        socket.on("Privat_room", (randomRoom,MyEmail,conversationalist) => {
            setAnswerEmail({Room:randomRoom, Usermail2:MyEmail, Usermail1:conversationalist});
        });

        socket.on("disconnectname",(disconnectName)=>{
            setAnswerEmail({Room:"server",Usermail2:disconnectName});
        })
    },[])
     

    useEffect(()=>{
        if(AnswerEmail!==""){
            if(AnswerEmail.Room==="server"){
                let newAnswerlist= Answer_List.filter(answ => answ.Usermail2 !== AnswerEmail.Usermail2);
                let newRoomlist= Rooms_List.filter(room => room.Usermail2 !== AnswerEmail.Usermail2);
                setAnswer_List(newAnswerlist);
                setRooms_List(newRoomlist);
            }
            else{
                let exist_answer_email= Answer_List.some(ans => ans.Usermail2===AnswerEmail.Usermail2);
                !exist_answer_email &&  setAnswer_List((prev)=>([...prev,AnswerEmail]));
                setRooms_List((prev)=>([...prev,AnswerEmail]));
            }
        }
    },[AnswerEmail])
  
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
                                onKeyPress={(event)=>{
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
                                    <div className={user===mail ? "user1" :"user"}  key={uidx} onClick={(event)=>{privat_message(event)}}>{user}</div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="chat_down">
                <div  className="Answer_zentrale_div">
                    {Answer_List.map((AnswerUser,Aidx)=>{
                        console.log(Answer_List)
                        return(
                            <div key={Aidx}>
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
                    {PrivatChat && Rooms_List.map((RoomData,Ridx)=>{
                        console.log(RoomData)
                        return(
                            <div key={Ridx} className="privat_room">
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