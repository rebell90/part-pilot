// app/routes/webhooks.app.uninstalled.jsx

/**
 * Shopify webhook: app/uninstalled
 * Runs only on the server — deletes sessions when the app is uninstalled.
 */
export async function action({ request }) {
  // Dynamically import db.server to ensure it's never bundled client-side
  const { prisma } = await import("../../utils/db.server.js");

  try {
    // Example cleanup — delete all sessions
    await prisma.session.deleteMany();
    console.log("✅ App uninstalled, sessions cleaned up");
  } catch (error) {
    console.error("❌ Failed to clean up on uninstall:", error);
  }

  return new Response("ok", { status: 200 });
}

// No UI needed — webhook endpoint only
export default function WebhookUninstalled() {
  return null;
}