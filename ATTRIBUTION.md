# Image attribution

Campus photographs used in Route are from **Wikimedia Commons**. They are included for recognition in this hackathon demo and are **not** official university materials or partnerships.

Each image’s Commons file page (license + author) is linked from the UI citation and listed in `public/universities/manifest.json` / `lib/campus-images.json`.

All **43** catalog universities have a recognition image. A few use **place-context** imagery (city/skyline) where a reliable Commons campus exterior was not practical for this demo — labeled in the manifest `demoNote`.

To refresh missing files locally:

```bash
node scripts/fetch-campus-images.mjs
```
