import React from "react";
import { render } from "react-dom";

import Home from "./Home";

// export default class App extends Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     return <h1>Testing</h1>;
//   }
// }

export default function App() {
  return (
    <div className="center">
      <Home />
    </div>
  );
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
