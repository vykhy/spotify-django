import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoom from "./CreateRoom";
import Room from "./Room";

export default function Home() {
  return (
    <Router>
      <Routes>
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </Router>
  );
}
