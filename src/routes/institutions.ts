import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { sector, classification } = req.query;
    const institutions = await prisma.institution.findMany({
      where: {
        sector: sector ? String(sector) : undefined,
        classification: classification ? String(classification) : undefined,
      },
      orderBy: { name: "asc" },
    });
    res.json(institutions);
  } catch (err) {
    next(err);
  }
});

export default router;
