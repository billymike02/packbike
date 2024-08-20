import logo from "./logo.svg";
import bike from "./assets/images/bike.svg";
import "./App.css";
import GearDropdown from "./components/GearDropdown";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="App">
      <Sidebar></Sidebar>
      <div className="Workspace">
        <div className="Manager">
          <nav>
            <ul>
              <li>
                <a>Add</a>
              </li>
              <li>
                <a>Edit</a>
              </li>
              <li>
                <a>Search</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="Display">
          <img src={bike} className="App-logo" alt="logo" />
          <GearDropdown></GearDropdown>
        </div>
      </div>
    </div>
  );
}

export default App;
