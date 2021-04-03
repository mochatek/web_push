// Get user's name
const username = document.querySelector("#username").innerText;

// Notification count
const count = document.querySelector("#count");

// Check compatibility
if ("serviceWorker" in navigator) {
  initialize().catch((err) => console.error(err));
} else {
  console.log("Service Worker Unsupported.");
}

async function initialize() {
  // Register service wroker
  const swRegistration = await navigator.serviceWorker.register(
    "./static/sw.js"
  );

  console.log("Service Worker registered.");
  console.dir(swRegistration);

  // Add event listener to the service worker, to increment count on recieving notification from server
  navigator.serviceWorker.onmessage = (event) => {
    count.innerText = +count.innerText + 1;

    console.log(event.data.message);
  };

  // Get public key from server - used for encrypted communication between push service and client
  const response = await fetch("/subscribe");
  const vapidPublicKey = await response.text();

  console.log(`Public key recieved: ${vapidPublicKey}`);

  // Subscribe to the browser's push service for push notification and get the subscription token
  const subscriptionToken = await swRegistration.pushManager.subscribe({
    applicationServerKey: urlB64ToUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  });

  console.log("Push registered. Subscription token created.");
  console.dir(subscriptionToken);

  // Send subscription token to server
  await fetch("/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subToken: JSON.stringify(subscriptionToken),
      username,
    }),
  });
}

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
