// app/routes/app.metaobject-test.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const query = `
    {
      metaobjects(first: 1, type: "part_category") {
        nodes {
          id
          type
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const result = await response.json();

    if (result.errors) {
      return json({ error: result.errors }, { status: 400 });
    }

    return json({ success: true, data: result.data });
  } catch (err) {
    return json({ error: err.message || err.toString() }, { status: 500 });
  }
};

export default function MetaobjectTest() {
  return <p>Check your network tab or use the API route directly.</p>;
}