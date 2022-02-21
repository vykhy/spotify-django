import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@material-ui/core";

export default function Room() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const getRoomDetails = async () => {
    const response = await fetch(`/api/get-room?code=${roomCode}`);
    const data = await response.json();

    setGuestCanPause(data.guest_can_pause);
    setVotesToSkip(data.votes_to_skip);
    setIsHost(data.is_host);
  };

  useEffect(() => {
    getRoomDetails();
  }, []);

  const leaveRoom = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      navigate("/");
    });
  };

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Code: {roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Votes required to skip: {votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Guest can pause: {guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Host: {isHost.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="primary" variant="outlined" onClick={leaveRoom}>
            Leave Room
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
