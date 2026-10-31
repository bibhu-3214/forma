import React, { lazy, Suspense } from "react";
import WorkspaceLoading from "./platform/WorkspaceLoading";
import WorkspaceBoundary from "./platform/WorkspaceBoundary";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
const App = lazy(() => import("./App"));
import ConnectedForma from "./ConnectedForma";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkspaceBoundary>
        <Suspense fallback={<WorkspaceLoading />}>
          {import.meta.env.MODE === "demo" ? <App /> : <ConnectedForma />}
        </Suspense>
      </WorkspaceBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
