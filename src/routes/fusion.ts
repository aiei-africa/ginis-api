import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  res.json({ message: "Fusion Intelligence gated endpoint scaffold. Cross-pillar queries land here once pillar data is live." });
});

export default router;
