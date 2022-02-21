import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Room() {
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

  return (
    <div>
      <p>{roomCode}</p>
      <p>{votesToSkip}</p>
      <p>{guestCanPause.toString()} </p>
      <p>{isHost.toString()} </p>
    </div>
  );
}
