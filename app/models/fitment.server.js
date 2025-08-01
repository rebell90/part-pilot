// /app/models/fitment.server.js

import { prisma } from "../utils/db.server";

export async function getFitments() {
  return prisma.fitment.findMany();
}

export async function addFitment({ make, model, year, chassis }) {
  const tagParts = [
    make.toLowerCase(),
    model.toLowerCase().replace(/\s+/g, "-"),
    chassis ? chassis.toLowerCase().replace(/\s+/g, "-") : null,
    year
  ].filter(Boolean);

  const tag = tagParts.join("-");

  return prisma.fitment.create({
    data: { make, model, year, chassis, tag },
  });
}

export async function deleteFitment(id) {
  return prisma.fitment.delete({
    where: { id: Number(id) },
  });
}
