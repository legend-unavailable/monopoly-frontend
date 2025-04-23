import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Lobby from "./pages/Lobby"
import Queue from "./pages/Queue"
import Game from "./pages/Game"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="Signup" element={<Signup />} />
        <Route path="Lobby" element={<Lobby />} />
        <Route path="/Queue" element={<Queue />} />
        <Route path="/Game/:gameID" element={<Game />} />
      </Routes>
    </Router>
  );
  //test run
}

export default App
