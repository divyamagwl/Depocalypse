import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";

import MainLayout from "./containers/MainLayout";
import './App.css'

function App() {
  return (
    <div className='App'>
      <Router>
        <MainLayout>
          <BaseRouter />
        </MainLayout>
      </Router>
    </div>
  );
}

export default App;
