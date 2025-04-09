import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Lobby from "./pages/Lobby"
import Queue from "./pages/Queue"
import Character_Select from "./pages/Character_Select"
import Game from "./pages/Game"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="Signup" element={<Signup />} />
        <Route path="Lobby" element={<Lobby />} />
        <Route path="/Queue" element={<Queue />} />
        <Route path="Character_Select" element={<Character_Select />} />
        <Route path="Game" element={<Game />} />
      </Routes>
    </Router>
  );
  //test run
}

export default App
