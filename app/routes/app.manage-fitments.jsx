import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { getFitments, addFitment, deleteFitment } from "../models/fitment.server";

export async function loader() {
  const combos = await getFitments();
  return json({ combos });
}

export async function action({ request }) {
  const formData = await request.formData();

  if (formData.get("_action") === "add") {
    await addFitment({
      make: formData.get("make"),
      model: formData.get("model"),
      year: formData.get("year"),
      chassis: formData.get("chassis"), // ✅ NEW
    });
  }

  if (formData.get("_action") === "delete") {
    await deleteFitment(formData.get("id"));
  }

  return redirect("/app/manage-fitments");
}

export default function ManageFitments() {
  const { combos } = useLoaderData();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Manage Vehicle Fitments</h1>

      <Form method="post">
        <input name="make" placeholder="Make" required />
        <input name="model" placeholder="Model" required />
        <input name="year" placeholder="Year" required />
        <input name="chassis" placeholder="Chassis (optional)" />
        <button type="submit" name="_action" value="add">
          Add Combo
        </button>
      </Form>

      <ul style={{ marginTop: "2rem" }}>
        {combos.map((c) => (
          <li key={c.id}>
            {c.make} {c.model} {c.chassis ? `(${c.chassis})` : ""} {c.year} →{" "}
            <code>{c.tag}</code>
            <Form method="post" style={{ display: "inline" }}>
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" name="_action" value="delete">
                Delete
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}