import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import {
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { Radio, RadioGroup, FormControlLabel } from "@material-ui/core";

export default function CreateRoom() {
  const defaultVotes = 2;
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [votesToSkip, setVotesToSkip] = useState(defaultVotes);

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
    const response = await fetch("/api/create/", requestOptions);
    console.log(response.data);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          Create a room
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl component={"fieldset"}>
          <FormHelperText>
            <div align="center">Control lolra</div>
          </FormHelperText>
          <RadioGroup
            row
            defaultValue={"true"}
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
            defaultValue={defaultVotes}
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
        <Button color="primary" variant="contained" onClick={handleCreateRoom}>
          Create a room
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );
}
//27:04
