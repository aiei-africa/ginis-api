import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

interface RegionalRow {
  year: number;
  election_code: string;
  election_type: string;
  region_id: string;
  region_name: string;
  registered_voters: number | null;
  total_cast: number | null;
  valid_votes: number | null;
  rejected_ballots: number | null;
  turnout_pct: string | null;
  candidate_id: string;
  candidate_name: string;
  party_abbr: string | null;
  party_name: string | null;
  colour_hex: string | null;
  votes: number;
  vote_share: string | null;
}

interface ConstituencyRow extends RegionalRow {
  constituency_id: string;
  constituency_name: string;
  ec_code: string;
  collation_status: string;
  declared_at: string | null;
}

// GET /electoral/regional?year=2024&type=PRESIDENTIAL
router.get("/regional", async (req, res, next) => {
  try {
    const year = Number(req.query.year) || 2024;
    const type = String(req.query.type || "PRESIDENTIAL").toUpperCase();

    const rows = await prisma.$queryRaw<RegionalRow[]>`
      SELECT * FROM ginis.v_regional_election_results
      WHERE year = ${year} AND election_type = ${type}
      ORDER BY region_name, votes DESC
    `;

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /electoral/constituencies?year=2024&type=PRESIDENTIAL
router.get("/constituencies", async (req, res, next) => {
  try {
    const year = Number(req.query.year) || 2024;
    const type = String(req.query.type || "PRESIDENTIAL").toUpperCase();

    const rows = await prisma.$queryRaw<ConstituencyRow[]>`
      SELECT * FROM ginis.v_constituency_election_results
      WHERE year = ${year} AND election_type = ${type}
      ORDER BY constituency_name, votes DESC
    `;

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /electoral/constituencies/:id?year=2024&type=PRESIDENTIAL
router.get("/constituencies/:id", async (req, res, next) => {
  try {
    const year = Number(req.query.year) || 2024;
    const type = String(req.query.type || "PRESIDENTIAL").toUpperCase();
    const { id } = req.params;

    const rows = await prisma.$queryRaw<ConstituencyRow[]>`
      SELECT * FROM ginis.v_constituency_election_results
      WHERE constituency_id = ${id} AND year = ${year} AND election_type = ${type}
      ORDER BY votes DESC
    `;

    if (!rows.length) return res.status(404).json({ error: "No results found for this constituency/year/type" });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /electoral/national?year=2024&type=PRESIDENTIAL
router.get("/national", async (req, res, next) => {
  try {
    const year = Number(req.query.year) || 2024;
    const type = String(req.query.type || "PRESIDENTIAL").toUpperCase();

    const rows = await prisma.$queryRaw<RegionalRow[]>`
      SELECT * FROM ginis.v_national_election_results
      WHERE year = ${year} AND election_type = ${type}
      ORDER BY votes DESC
    `;

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
