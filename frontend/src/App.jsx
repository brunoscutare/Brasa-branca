import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import('./pages/HomePage'))

function App() {
  return (
    <Routes>
      <Route
        path="/HomePage"
        element={
          <HomePage />
        }
      />
    </Routes>
  );
}

export default App;