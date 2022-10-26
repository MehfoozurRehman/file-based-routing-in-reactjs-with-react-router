import React, { Fragment, lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { withStyles } from "react-critical-css";

const PRESERVED = import.meta.globEager(
  "/src/layouts/(_app|_notFound|_loading).jsx"
);
const ROUTES = import.meta.glob("/src/screens/**/[a-z[]*.jsx");
const STYLES = import.meta.globEager("/src/styles/*.scss");

const preserved = Object.keys(PRESERVED).reduce((preserved, file) => {
  const key = file.replace(/\/src\/layouts\/|\.jsx$/g, "");
  return { ...preserved, [key]: PRESERVED[file].default };
}, {});

export const routes = Object.keys(ROUTES).map((route) => {
  const path = route
    .replace(/\/src\/screens|index|\.jsx$/g, "")
    .replace(/\[\.{3}.+\]/, "*")
    .replace(/\[(.+)\]/, ":$1");
  return {
    path,
    component: lazy(ROUTES[route]),
    preload: ROUTES[route],
  };
});

if (Object.keys(STYLES).length === 0) {
  console.error("No styles found");
}
if (Object.keys(ROUTES).length === 0) {
  console.error("No routes found");
}
if (!Object.keys(PRESERVED).includes("/src/layouts/_notFound.jsx")) {
  console.error("No 404 found");
}
if (!Object.keys(PRESERVED).includes("/src/layouts/_loading.jsx")) {
  console.error("No loader found");
}
const Router = () => {
  const location = useLocation();
  const App = preserved?.["_app"] || Fragment;
  const NotFound = preserved?.["_notFound"] || Fragment;
  const Loading = preserved?.["_loading"] || Fragment;

  return (
    <Suspense fallback={<Loading />}>
      <App
        not404={
          routes.map((route) => route.path).includes(location.pathname) ||
          routes.map((route) => route.path).includes(location.pathname + "/")
        }
      >
        <Routes>
          {routes.map(({ path, component: Component = Fragment }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </App>
    </Suspense>
  );
};

export default withStyles(STYLES)(Router);
