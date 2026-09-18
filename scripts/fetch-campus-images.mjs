#!/usr/bin/env node
/**
 * Download missing campus stills from Wikimedia Commons (demo recognition imagery).
 * Usage: node scripts/fetch-campus-images.mjs
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import path from "path";

const OUT_DIR = path.resolve("public/universities");
const MANIFEST_PATH = path.resolve("lib/campus-images.json");
const PUBLIC_MANIFEST = path.resolve("public/universities/manifest.json");
const UA = "LOCUS-RouteDemo/1.0 (hackathon educational; contact: local-dev)";

/** @type {Record<string, { file: string; caption: string }>} */
const MISSING = {
  princeton: {
    file: "Nassau_Hall,_Princeton_University.jpg",
    caption: "Nassau Hall, Princeton University",
  },
  stanford: {
    file: "Hoover_Tower,_Stanford_University.jpg",
    caption: "Hoover Tower, Stanford University",
  },
  caltech: {
    file: "Beckman_Institute,_Caltech.jpg",
    caption: "Beckman Institute, Caltech",
  },
  cmu: {
    file: "College_of_Fine_Arts,_Carnegie_Mellon.jpg",
    caption: "College of Fine Arts, Carnegie Mellon",
  },
  uiuc: {
    file: "Altgeld_Hall.jpg",
    caption: "Altgeld Hall, University of Illinois Urbana-Champaign",
  },
  michigan: {
    file: "Angell_Hall.JPG",
    caption: "Angell Hall, University of Michigan",
  },
  berkeley: {
    file: "Sather_Gate_UC_Berkeley.jpg",
    caption: "Sather Gate, UC Berkeley",
  },
  amherst: {
    file: "Johnson_Chapel,_Amherst_College.jpg",
    caption: "Johnson Chapel, Amherst College",
  },
  rice: {
    file: "Lovett_College,_Rice_University.jpg",
    caption: "Lovett College, Rice University",
  },
  duke: {
    file: "Duke_Chapel.jpg",
    caption: "Duke Chapel, Duke University",
  },
  imperial: {
    file: "Queen's_Tower,_Imperial_College_London.jpg",
    caption: "Queen's Tower, Imperial College London",
  },
  edinburgh: {
    file: "Old_College,_University_of_Edinburgh.jpg",
    caption: "Old College, University of Edinburgh",
  },
  cambridge: {
    file: "King's_College_Chapel_West.jpg",
    caption: "King's College Chapel, Cambridge",
  },
  oxford: {
    file: "Radcliffe_Camera,_Oxford_-_Diliff.jpg",
    caption: "Radcliffe Camera, University of Oxford",
  },
  manchester: {
    file: "University_of_Manchester_Main_Building.jpg",
    caption: "Main Building, University of Manchester",
  },
  mcgill: {
    file: "Arts_Building_of_McGill_University.jpg",
    caption: "Arts Building, McGill University",
  },
  ubc: {
    file: "Irving_K._Barber_Learning_Centre.jpg",
    caption: "Irving K. Barber Learning Centre, UBC",
  },
  mcmaster: {
    file: "University_Hall,_McMaster_University.jpg",
    caption: "University Hall, McMaster University",
  },
  khalifa: {
    file: "Khalifa_University.jpg",
    caption: "Khalifa University campus",
  },
  aus: {
    file: "American_University_of_Sharjah_Main_Building.jpg",
    caption: "Main Building, American University of Sharjah",
  },
  uva: {
    file: "Oudemanhuispoort.jpg",
    caption: "Oudemanhuispoort, University of Amsterdam",
  },
  tue: {
    file: "Technische_Universiteit_Eindhoven_hoofdgebouw.jpg",
    caption: "Main building, Eindhoven University of Technology",
  },
  rwth: {
    file: "RWTH_Aachen_SuperC.jpg",
    caption: "SuperC, RWTH Aachen",
  },
  heidelberg: {
    file: "Universitätsbibliothek_Heidelberg.jpg",
    caption: "University Library, Heidelberg",
  },
  epfl: {
    file: "Rolex_Learning_Center.jpg",
    caption: "Rolex Learning Center, EPFL",
  },
  jhu: {
    file: "Gilman_Hall,_Johns_Hopkins_University.jpg",
    caption: "Gilman Hall, Johns Hopkins University",
  },
  williams: {
    file: "Williams_College_Chapin_Hall.jpg",
    caption: "Chapin Hall, Williams College",
  },
  kcl: {
    file: "King's_College_London_Strand_Campus.jpg",
    caption: "Strand Campus, King's College London",
  },
  hku: {
    file: "HKU_Main_Building.jpg",
    caption: "Main Building, University of Hong Kong",
  },
  hkust: {
    file: "HKUST_Overview.jpg",
    caption: "Hong Kong University of Science and Technology",
  },
  cuhk: {
    file: "The_Chinese_University_of_Hong_Kong_Campus.jpg",
    caption: "Campus, Chinese University of Hong Kong",
  },
};

const DEMO_NOTE =
  "Wikimedia Commons campus photograph. Demo recognition imagery — not an official partnership.";

async function downloadFile(commonsFile, dest) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    commonsFile,
  )}?width=1400`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" },
    redirect: "follow",
  });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} for ${commonsFile}`);
  }
  const type = res.headers.get("content-type") || "";
  if (!type.includes("image")) {
    throw new Error(`Not an image (${type}) for ${commonsFile}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  const size = existsSync(dest) ? (await import("fs")).statSync(dest).size : 0;
  if (size < 8_000) throw new Error(`File too small (${size}b) for ${commonsFile}`);
  return size;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const results = [];

  for (const [id, meta] of Object.entries(MISSING)) {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    process.stdout.write(`${id}… `);
    try {
      if (!existsSync(dest) || (await import("fs")).statSync(dest).size < 8_000) {
        const size = await downloadFile(meta.file, dest);
        process.stdout.write(`ok ${Math.round(size / 1024)}kb\n`);
      } else {
        process.stdout.write("exists\n");
      }
      manifest[id] = {
        src: `/universities/${id}.jpg`,
        caption: meta.caption,
        commonsTitle: meta.file,
        sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(meta.file).replace(/%20/g, "_")}`,
        demoNote: DEMO_NOTE,
      };
      results.push({ id, ok: true });
    } catch (err) {
      process.stdout.write(`FAIL ${err.message}\n`);
      results.push({ id, ok: false, error: String(err.message) });
    }
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(PUBLIC_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone. ok=${results.length - failed.length} fail=${failed.length}`);
  if (failed.length) {
    console.log(failed);
    process.exitCode = 1;
  }
}

main();
