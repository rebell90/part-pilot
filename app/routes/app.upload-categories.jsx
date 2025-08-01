import { json } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { parse } from "csv-parse/sync";
import { useState } from "react";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const csvText = formData.get("csv");

  let records;
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (err) {
    return json({ error: "Failed to parse CSV" });
  }

  // Fetch existing categories to resolve parent relationships
  const existing = await fetchAllPartCategories(admin);
  const slugToId = Object.fromEntries(existing.map((c) => [c.slug, c.id]));

  const errors = [];
  for (const row of records) {
    if (!row.title || !row.slug) {
      errors.push(`Missing title/slug in row: ${JSON.stringify(row)}`);
      continue;
    }

    const parentId = row.parent_slug ? slugToId[row.parent_slug] : null;
    if (row.parent_slug && !parentId) {
      errors.push(`Parent slug '${row.parent_slug}' not found for '${row.title}'`);
      continue;
    }

    try {
      await createPartCategory(admin, {
        title: row.title,
        slug: row.slug,
        description: row.description || "",
        sort_order: parseInt(row.sort_order) || 0,
        parent_category: parentId,
      });
    } catch (err) {
      errors.push(`Failed to create '${row.title}': ${err.message}`);
    }
  }

  return json({ success: true, errors });
}

export default function UploadCategories() {
  const actionData = useActionData();
  const [csv, setCsv] = useState("");

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Part Categories</h1>
      <Form method="post">
        <textarea
          name="csv"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={10}
          cols={80}
          placeholder="Paste CSV: title,slug,parent_slug,description,sort_order"
        />
        <br />
        <button type="submit">Upload</button>
      </Form>

      {actionData?.errors?.length > 0 && (
        <div style={{ marginTop: 20, color: "red" }}>
          <h3>Errors:</h3>
          <ul>
            {actionData.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {actionData?.success && !actionData?.errors?.length && (
        <p style={{ color: "green", marginTop: 20 }}>✅ Upload successful!</p>
      )}
    </div>
  );
}

async function fetchAllPartCategories(admin) {
  const query = `
    query GetPartCategories {
      metaobjects(type: "part_category", first: 100) {
        nodes {
          id
          handle
          fields {
            key
            value
          }
        }
      }
    }
  `;

  const response = await admin.graphql(query);

  const nodes = response?.data?.metaobjects?.nodes;
  if (!Array.isArray(nodes)) {
    throw new Error("Metaobjects fetch failed or returned unexpected shape");
  }

  return nodes.map((node) => {
    const slugField = node.fields.find((f) => f.key === "slug");
    return {
      id: node.id,
      slug: slugField?.value,
    };
  }).filter(Boolean);
}

async function createPartCategory(admin, { title, slug, description, sort_order, parent_category }) {
  const mutation = `
    mutation CreateCategory($input: MetaobjectCreateInput!) {
      metaobjectCreate(input: $input) {
        metaobject { id handle }
        userErrors { field message }
      }
    }
  `;

  const input = {
    type: "part_category",
    fields: [
      { key: "title", value: title },
      { key: "slug", value: slug },
      { key: "description", value: description },
      { key: "sort_order", value: sort_order.toString() }
    ]
  };

  if (parent_category) {
    input.fields.push({
      key: "parent_category",
      reference: { id: parent_category }
    });
  }

  const res = await admin.graphql(mutation, { input });
  const errors = res?.data?.metaobjectCreate?.userErrors;
  if (errors?.length > 0) {
    throw new Error(errors[0].message);
  }
}