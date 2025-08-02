export const action = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const prisma = (await import("../utils/db.server")).default;

  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    await prisma.session.deleteMany({ where: { shop } });
  }

  return new Response();
};