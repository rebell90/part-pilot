import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("Scopes payload:", payload);

  if (session) {
    const { prisma } = await import("../utils/db.server");

    // Use payload.scopes if it exists, otherwise fallback
    const scopes = Array.isArray(payload?.scopes)
      ? payload.scopes.join(",")
      : payload?.current?.toString?.() || "";

    await prisma.session.update({
      where: { id: session.id },
      data: { scope: scopes },
    });
  }

  return new Response();
};