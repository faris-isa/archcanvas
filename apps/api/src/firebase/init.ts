import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app: App;

if (getApps().length === 0) {
  const isDev = process.env.NODE_ENV !== "production";

  if (
    isDev &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !process.env.FIREBASE_SERVICE_ACCOUNT
  ) {
    // Path to the dummy-credentials.json we created
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
      __dirname,
      "../../dummy-credentials.json",
    );
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  const useEmulator = !!process.env.FIRESTORE_EMULATOR_HOST || isDev;

  if (useEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  }

  const options: any = {
    projectId: useEmulator ? "demo-archcanvas" : "archcanvas-dev",
  };

  if (serviceAccount) {
    options.credential = cert(serviceAccount);
  }

  app = initializeApp(options);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
