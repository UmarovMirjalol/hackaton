import manifest from "@/lib/campus-images.json";

export type CampusImage = {
  src: string;
  caption: string;
  commonsTitle: string;
  sourceUrl: string;
  demoNote: string;
};

const images = manifest as Record<string, CampusImage>;

export function campusImage(universityId: string): CampusImage | null {
  return images[universityId] ?? null;
}

export const IMAGE_DISCLAIMER =
  "Campus photographs are from Wikimedia Commons for recognition in this demo. They are not official university materials or a partnership.";
