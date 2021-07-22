import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";

import MainLayout from "./containers/MainLayout";

function App() {
  return (
    <div>
      <Router>
        <MainLayout>
          <BaseRouter />
        </MainLayout>
      </Router>
    </div>
  );
}

export default App;
