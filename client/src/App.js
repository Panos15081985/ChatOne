import './App.css';
import Login from './components/Login';
import Chatpage from './components/Chatpage';
import { BrowserRouter , Routes , Route } from 'react-router-dom';
function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/Chatpage' element={<Chatpage/>} />
    </Routes>
   </BrowserRouter>
  );
}

export default App;
