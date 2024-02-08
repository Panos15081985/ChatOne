import {useState} from "react";
import { useNavigate } from "react-router-dom";

function Login(){
    const navigate = useNavigate();
    let[register,setRegister]=useState(false);
    let[msg,setMsg]=useState("");
    let[NewUser,setNewUser]=useState({
        mail:"",
        Pass:""
    })
    let[UserDaten,setUserDaten]=useState({
        mail:"",
        Pass:""
    })
    
    let login=()=>{
        fetch("http://localhost:3001/login",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({usermail : UserDaten.mail , userpass : UserDaten.Pass})
        })
        .then((response)=>{
            return response.json();
        })
        .then((data)=>{
            if (data.success==="1") {
                navigate("/Chatpage", { state: { mail: UserDaten.mail, userId: data.uid }});
            } 
            else if(data.success==="2"){
                setMsg( "Wrong Email or Password");
            }
            else{
                setMsg("User has already used the chat.");
            }
            
        })
    }

    let Newuser=()=>{
        if(NewUser.mail==="" || NewUser.Pass===""){
            setMsg("Wrong Email or Password")
        }
        else{
            fetch("http://localhost:3001/register",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({usermail :NewUser.mail , userpass : NewUser.Pass})
            })
            .then((response)=>{
                return response.json();
            })
            .then((data)=>{
                setMsg(data.message)
                data.message==="Registration successful" && setRegister(false)
            })
            .catch((error) => {
                console.error("Error during registration:", error);
            });
        }
    
    }
 
    return(
        <div className="login">
            <h3>Chat One</h3>
            <div className="login_inputs">
                <input 
                    placeholder="Username" 
                    onChange={(event)=>{setUserDaten((prev)=>({...prev, mail: event.target.value}))}}/>
                <input 
                    placeholder="Password"
                    type="password"
                    onChange={(event)=>{setUserDaten((prev)=>({...prev, Pass: event.target.value}))}}/>
                <button onClick={login}>Login</button>
                <p onClick={()=>{setRegister(prev=>!prev)}}>Register</p>
            </div>
            {register && 
                <div className="Register">
                    <input 
                        placeholder="username" 
                        onChange={(event)=>{setNewUser((prev)=>({...prev, mail: event.target.value}))}}/>
                    <input 
                        placeholder="Password"
                        type="password"
                        onChange={(event)=>{setNewUser((prev)=>({...prev, Pass: event.target.value}))}}/>
                    <button onClick={Newuser}>Register</button>
                </div>
            }
            <p>{msg}</p>
        </div>
    )
}
export default Login;