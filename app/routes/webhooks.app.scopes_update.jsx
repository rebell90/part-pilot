import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    const { prisma } = await import("../utils/db.server");
    await prisma.session.update({
      where: { id: session.id },
      data: { scope: payload.current.toString() },
    });
  }

  return new Response();
};