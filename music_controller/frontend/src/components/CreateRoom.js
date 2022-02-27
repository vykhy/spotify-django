import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@material-ui/core/Button";
import {
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Collapse,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Link } from "react-router-dom";
import { Radio, RadioGroup, FormControlLabel } from "@material-ui/core";

export default function CreateRoom(props) {
  const {
    votes = 2,
    canPause = true,
    update = false,
    roomCode = null,
    updateCallback = () => {},
  } = props;

  const history = useNavigate();

  const [guestCanPause, setGuestCanPause] = useState(canPause);
  const [votesToSkip, setVotesToSkip] = useState(votes);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleVotesChange = (e) => {
    setVotesToSkip(e.target.value);
  };

  const handleGuestCanPause = (e) => {
    setGuestCanPause(e.target.value === "true" ? true : false);
  };

  const handleCreateRoom = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };
    const response = await fetch("/api/create", requestOptions);
    const data = await response.json();
    history(`/room/${data.code}`);
  };

  const handleUpdateRoom = async () => {
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
        code: roomCode,
      }),
    };
    const response = await fetch("/api/update-room", requestOptions);
    //const data = await response.json();
    if (response.status == 200) {
      setSuccessMessage("Room settings updated");
      updateCallback();
    } else if (response.status === 404) {
      setError("Failed to update settings " + data.message);
    } else {
      setError("Update failed");
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Collapse in={successMessage != null || error != null}>
          {successMessage ? (
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}{" "}
            </Alert>
          ) : null}
          {error ? (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}{" "}
            </Alert>
          ) : null}
        </Collapse>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          {update ? "Update Settings" : "Create a room"}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl component={"fieldset"}>
          <FormHelperText>
            <div align="center">Control lolra</div>
          </FormHelperText>
          <RadioGroup
            row
            defaultValue={guestCanPause.toString()}
            onChange={(e) => handleGuestCanPause(e)}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            ></FormControlLabel>
            <FormControlLabel
              value="false"
              control={<Radio color="secondary" />}
              label="No Control"
              labelPlacement="bottom"
            ></FormControlLabel>
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <TextField
            required={true}
            onChange={(e) => handleVotesChange(e)}
            type={"number"}
            defaultValue={votesToSkip}
            inputProps={{
              min: 1,
              style: {
                textAlign: "center",
              },
            }}
          />
          <FormHelperText>
            <div align="center">Votes required to skip song</div>
          </FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={update ? handleUpdateRoom : handleCreateRoom}
        >
          {update ? "Update Settings" : "Create a room"}
        </Button>
      </Grid>

      {/* if update is true, 'HIDE SETTINGS' btn will be rendered from Room component in renderSettings function  */}
      {!update ? (
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      ) : null}
    </Grid>
  );
}
