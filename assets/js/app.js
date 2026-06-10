import { navigate } from "./router.js";

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");

  if (!routeButton) return;

  navigate(routeButton.dataset.route);
});

navigate("platform-dashboard");
