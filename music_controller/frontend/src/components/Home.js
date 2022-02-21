import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Link, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoom from "./CreateRoom";
import Room from "./Room";

const RenderHomePage = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState(null);

  const a = async () => {
    const response = await fetch("/api/user-in-room");
    const data = await response.json();
    setRoomCode(data.code);
  };
  useEffect(() => {
    a();
    roomCode ? navigate(`/room/${roomCode}`) : setRoomCode(null);
  });
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} align="center">
        <Typography variant="h3" compact="h3">
          House Party
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Button color="primary" to="/join" component={Link}>
            Join a room {roomCode}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            to="/create"
            component={Link}
          >
            Create a room
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default function Home() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RenderHomePage />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </Router>
  );
}
