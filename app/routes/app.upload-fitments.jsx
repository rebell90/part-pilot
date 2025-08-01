import { json, redirect } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { parse } from "csv-parse/sync";
import { addFitment } from "../models/fitment.server";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("csvFile");

  if (!file || typeof file !== "object" || file.size === 0) {
    return json({ error: "Please upload a CSV file." });
  }

  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
  });

  let createdCount = 0;

  for (const row of records) {
    const make = row.make?.trim();
    const model = row.model?.trim();
    const year = row.year?.trim();
    const chassis = row.chassis?.trim();

    if (make && model && year) {
      await addFitment({ make, model, year, chassis });
      createdCount++;
    }
  }

  return json({ success: `Created ${createdCount} fitments.` });
};

export default function UploadFitments() {
  const result = useActionData();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bulk Upload Vehicle Fitments</h1>
      <Form method="post" encType="multipart/form-data">
        <input type="file" name="csvFile" accept=".csv" required />
        <button type="submit">Upload CSV</button>
      </Form>

      {result?.error && (
        <p style={{ color: "red" }}>{result.error}</p>
      )}
      {result?.success && (
        <p style={{ color: "green" }}>{result.success}</p>
      )}

      <p style={{ marginTop: "2rem" }}>
        ✅ Your CSV should have columns: <code>make,model,year,chassis</code>.
      </p>
    </div>
  );
}