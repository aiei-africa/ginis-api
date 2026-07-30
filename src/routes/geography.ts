import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/regions", async (_req, res, next) => {
  try {
    const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });
    res.json(regions);
  } catch (err) {
    next(err);
  }
});

router.get("/regions/:id", async (req, res, next) => {
  try {
    const region = await prisma.region.findUnique({
      where: { id: Number(req.params.id) },
      include: { districts: true },
    });
    if (!region) return res.status(404).json({ error: "Region not found" });
    res.json(region);
  } catch (err) {
    next(err);
  }
});

export default router;
