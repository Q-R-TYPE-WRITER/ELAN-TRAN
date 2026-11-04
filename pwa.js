if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("ESSENCE app is ready!"))
      .catch(error => console.log(error));
  });
}