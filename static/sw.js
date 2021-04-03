self.addEventListener("install", function (event) {
  console.log("Service Worker installing.");
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activating.");
});

self.addEventListener("push", async function (event) {
  console.log("Service Worker Push Received.");

  const message = event.data.text();

  if (message == "User subscription successful") {
    const options = {
      body: message,
    };

    // Show push notification
    event.waitUntil(self.registration.showNotification("Web Push", options));
  } else {
    // Post the message to the client: window
    for (const client of await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    })) {
      client.postMessage({ message });
    }
  }
});
