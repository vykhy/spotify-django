import React from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import PauseIcon from "@material-ui/icons/Pause";

export default function MusicPlayer({
  image_url,
  title,
  artist,
  is_playing,
  time,
  duration,
}) {
  // to manage song progress bar
  const songProgress = (time / duration) * 100;

  /**
   * pauses song on spotify api
   */
  function pauseSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions);
  }
  /**
   * plays song on spotify api
   */
  function playSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions);
  }
  /**handles play/pause button */
  function handlePause() {
    is_playing ? pauseSong() : playSong();
  }

  return (
    <Card>
      <Grid container alignItems="center">
        <Grid item align="center" xs={4}>
          <img src={image_url} alt="album" width={"100%"} height={"100%"} />
        </Grid>
        <Grid item align="center" xs={8}>
          <Typography variant="h5" component="h5">
            {title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {artist}
          </Typography>
          <div>
            <IconButton onClick={() => handlePause()}>
              {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton>
              <SkipNextIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgress} />
    </Card>
  );
}
