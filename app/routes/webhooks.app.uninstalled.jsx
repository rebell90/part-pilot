export const action = async ({ request }) => {
  // Lazy import server-only modules
  const { authenticate } = await import("../shopify.server");
  const { prisma } = await import("../utils/db.server");

  const { session, topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // On uninstall, just delete the session (if it exists)
  if (session) {
    await prisma.session.deleteMany({
      where: { shop },
    });
  }

  return new Response();
};