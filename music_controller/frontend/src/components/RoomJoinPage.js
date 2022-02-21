import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";

export default function RoomJoinPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState();
  const [error, setError] = useState();

  const handleJoinRoom = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: roomCode,
      }),
    };

    const response = await fetch(`/api/join-room`, requestOptions);
    const status = await response.status;
    switch (status) {
      case 200: {
        navigate(`/room/${roomCode}`);
        break;
      }
      default:
        setError("Invalid code");
    }
  };

  return (
    <div>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} align="center">
          <Typography variant="h4" component={"h4"}>
            Join a Room
          </Typography>
          <Grid item xs={12} align="center">
            <TextField
              error={error}
              label="Code"
              placeholder="Enter a room code"
              value={roomCode}
              helperText={error}
              variant="outlined"
              onChange={(e) => setRoomCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} align="center" style={{ margin: "5px 0" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleJoinRoom}
            >
              Enter Room
            </Button>
          </Grid>
          <Grid item xs={12} align="center">
            <Button variant="outlined" color="primary" to="/" component={Link}>
              Back
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
