import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    // Triggered whenever code changes
    axios
      .post("http://localhost:3001/login", {
        code,
      })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, "/");
      })
      .catch(() => {
        window.location = "/";
      });
  }, [code]);

  useEffect(() => {
    // Triggered whenever refreshToken or expiresIn changes
    if (!refreshToken || !expiresIn) return; // Because sometimes this executes before useEffect for code finishes executing
    const interval = setInterval(() => {
      // Using setTimeOut() will only execute one and not every time we refresh, so we use interval
      axios
        .post("http://localhost:3001/refresh", {
          refreshToken,
        })
        .then((res) => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(() => {
          window.location = "/";
        });
    }, (expiresIn - 60) * 1000); // Timeout is 1 minute before the token expires. 1000 is to turn s into ms.

    return () => clearInterval(interval); // To catch error. If refresh token expires before it times out, this keeps us from using the wrong refresh token
  }, [refreshToken, expiresIn]);

  return accessToken; // Passed back to Dashboard; allows the user to access the API; only lasts for an hour
  // On the client's side, set up a timer to call the server
}
