import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoom from "./CreateRoom";

// export default class App extends Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     return <h1>Testing</h1>;
//   }
// }

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
