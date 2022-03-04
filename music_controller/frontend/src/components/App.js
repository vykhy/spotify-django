import React from "react";
import { render } from "react-dom";

import Home from "./Home";

export default function App() {
  return (
    <div className="center">
      <Home />
    </div>
  );
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
