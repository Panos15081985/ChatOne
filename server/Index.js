const express = require("express");
const db = require("./DBConfig");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

let io = new Server(server,{
    cors: {
        origin:"http://localhost:3000",
        methods: ["GET","POST"],
    }
})


let=Rooms=[1,2]
let users=[];
let ids=[];
io.on("connection",(socket)=>{
    console.log("Hallo",socket.id)
  
    socket.on("email_send",(room,mail)=>{
        ids.push(socket.id)
        users.push(mail)
        io.emit("users",users)
        socket.join(room)
        socket.join(mail)
    })

    socket.on("send_message",(data)=>{
        io.to(data.room).emit("receive_message",data)
    })
     
    socket.on("PrivatMsg",(conversationalist,randomRoom,MyEmail)=>{
        socket.join(conversationalist)
        socket.join(randomRoom)
        socket.to(conversationalist).emit("Privat_room",randomRoom,MyEmail,conversationalist)
        socket.leave(conversationalist)
        let data={message:"Please wait until your partner accepts",Usermail:"server",Room:randomRoom}
        io.to(randomRoom).emit("receive_Privat_message",data)
        
    })

    socket.on("Privat_aksept_room",(PrivatRoom)=>{
        socket.join(PrivatRoom)
        let data={message:"You could communicate now !!",Usermail:"server",Room:PrivatRoom}
        io.to(PrivatRoom).emit("receive_Privat_message",data)
    })

    socket.on("Privat_nicht_Aksept_room",(room)=>{
        let data={message:"Your partner doesn't want to talk to you",Usermail:"server",Room:room}
        socket.to(room).emit("receive_Privat_message",data)
    })

    socket.on("sendPrivatMessage",(message,PrivatRoom,Usermail)=>{
        let data={message:message,Usermail:Usermail,Room:PrivatRoom}
        io.to(PrivatRoom).emit("receive_Privat_message",data)
    })

    socket.on("leave_Join",(del_RoomData)=>{
        let data1={message:"YOUR PARTNER HAS GONE FROM YOUR CHAT !!",Usermail:"server",Room:del_RoomData.Room}
        socket.to(del_RoomData.Room).emit("receive_Privat_message",data1)
        socket.leave(del_RoomData.Room)
    })

    socket.on("Answer_delete",(Answer_del)=>{
        console.log(Answer_del)
        socket.join(Answer_del.Usermail2)
        let data1="server"
        socket.to(Answer_del.Usermail2).emit("Privat_room",data1,Answer_del.Usermail1,Answer_del.Usermail2)
        socket.leave(Answer_del.Usermail2)
    })

    socket.on("disconnect",()=>{
        const index=ids.indexOf(socket.id)
        const newusers= users.filter((_,idx)=> idx !==index);
        const newids= ids.filter((id)=> id !== socket.id)
        const disconnectName =users[index]
        users=newusers
        ids=newids
        if(users.length!==0){
            io.emit("users",users)
            io.emit("disconnectname",disconnectName)
        }
        console.log("disconnect",socket.id)
        
    })


})

io.engine.on("connection_error", (err) => {
	io = new Server(server, {
		cors: {
			origin: "http://localhost:3000",
			methods: ["GET","POST"],
		}
	})		
});

server.listen(3001, ()=>{
    console.log("server is running")
})

app.post("/login",(req,res)=>{
    const Usermail= req.body.usermail;
    const Userpass= req.body.userpass;
    let exist=users.includes(Usermail)
    if(!exist){
        db.query("select* from cuser where mail='"+Usermail+"'",(err,results)=>{
            if (results.length !== 0 && results[0].upassword === Userpass) {
                res.status(200).json({
                    success: "1",
                    uid: results[0].uid,
                })
            }
            else{res.json({success:"2"})}
        })
    }
    else{res.json({success:"3"})}
})

app.post("/register",(req,res)=>{
    const rename= req.body.usermail
    const repass=req.body.userpass
    db.query("select* from cuser where mail='"+rename+"'",(err,results)=>{
        if(results.length !=0){
            res.json({ message: "email exist" });
        }
        else{
            db.query("INSERT INTO cuser (mail,upassword) VALUES ('"+rename+"','"+repass+"')",(err,results)=>{
                if (err) {
                    console.error("Error during registration:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                } else {
                    console.log("Registration successful");
                    res.status(200).json({ message: "Registration successful" });
                }
            })
        }
    })

})