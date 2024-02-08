import socket from "../Socket";

function Answer(props){
    let setPrivatChat=props.setPrivatChat;
    let Rooms_List=props.Rooms_List;
    let setRooms_List=props.setRooms_List;
    let Answer_List=props.Answer_List;
    let setAnswer_List=props.setAnswer_List;
    let AnswerUser=props.AnswerUser;
    
    let Join=()=>{
        socket.emit("Privat_aksept_room",AnswerUser.Room);
        let NewAnswerslist= Answer_List.filter(AnswerU => AnswerU.Room !==AnswerUser.Room);
        setAnswer_List(NewAnswerslist);
        setPrivatChat(true);
    }

    let Notjoin=()=>{
        let NewRooms=Rooms_List.filter(User=>User.Room!==AnswerUser.Room); 
        setRooms_List(NewRooms);
        socket.emit("Privat_nicht_Aksept_room",AnswerUser.Room);
        let NewAnswerslist= Answer_List.filter(AnswerU => AnswerU.Room !==AnswerUser.Room);
        setAnswer_List(NewAnswerslist);
    }

    return(
       <div className="privat_answer">
            <p>Do you want to talk to {AnswerUser.Usermail2} ?</p>
            <button style={{marginRight: "20px"}} onClick={Join}>jes</button>
            <button onClick={Notjoin}>No</button>
        </div>
    )
}
export default Answer;