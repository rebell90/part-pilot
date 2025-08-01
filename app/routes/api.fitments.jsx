import { json } from "@remix-run/node";
import { getFitments } from "../models/fitment.server";

export const loader = async () => {
  const combos = await getFitments();
  return json(combos);
};

// Fallback for testing:
// export const loader = async () => {
//   return json([{ test: "api works!" }]);
// };
