import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoom from "./CreateRoom";
import MusicPlayer from "./MusicPlayer";

export default function Room({ clearCode }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState({});

  /**
   * get room details from the backend and update component
   */
  const getRoomDetails = async () => {
    const response = await fetch(`/api/get-room?code=${roomCode}`);
    const status = await response.status;

    if (status === 200) {
      const data = await response.json();
      // update state
      setGuestCanPause(data.guest_can_pause);
      setVotesToSkip(data.votes_to_skip);
      setIsHost(data.is_host);
      // authenticate host with spotify
      if (data.is_host) authenticateSpotify();
    } else {
      // or else remove code and redirect to home
      clearCode();
      navigate("/");
    }
  };

  useEffect(() => {
    getRoomDetails();
    getCurrentSong();
  }, []);

  useEffect(() => {
    // set up polling for checking the current song and its status
    const interval = setInterval(getCurrentSong, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  /**
   * hit backend to authenticate host with spotify
   */
  function authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  /**
   * get current song from the backend and update state
   */
  function getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        console.log("called");
        setSong(data);
      });
  }

  /**
   * leave room
   */
  const leaveRoom = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      clearCode();
      navigate("/");
    });
  };

  /**
   * renders settings button
   */
  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  /**
   *  renders settings page
   */
  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoom
            update="true"
            votes={votesToSkip}
            canPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowSettings(false)}
          >
            Hide settings
          </Button>
        </Grid>
      </Grid>
    );
  };

  return showSettings ? (
    renderSettings()
  ) : (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Code: {roomCode}
          </Typography>
        </Grid>
        {song.title && <MusicPlayer {...song} />}
        {isHost ? renderSettingsButton() : null}
        <Grid item xs={12} align="center">
          <Button color="primary" variant="outlined" onClick={leaveRoom}>
            Leave Room
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
