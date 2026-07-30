import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/constituencies", async (_req, res, next) => {
  try {
    const constituencies = await prisma.constituency.findMany({
      include: { region: true },
      orderBy: { name: "asc" },
    });
    res.json(constituencies);
  } catch (err) {
    next(err);
  }
});

router.get("/constituencies/:id/results", async (req, res, next) => {
  try {
    const results = await prisma.electionResult.findMany({
      where: { constituencyId: Number(req.params.id) },
      orderBy: [{ year: "desc" }, { votes: "desc" }],
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
