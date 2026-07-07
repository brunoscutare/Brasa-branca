import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import('./pages/HomePage'))

function App() {
  return (

    <Route
      path="/HomePage"
      element={
        < BrowserRouter >
          <Routes>
            <HomePage />
          </Routes>
        </BrowserRouter >
      }
    />
  );
}

export default App;