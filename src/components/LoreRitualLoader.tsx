"use client";

import { Leaf } from "lucide-react";

interface LoreRitualLoaderProps {
  previewImageUrl?: string | null;
}

export default function LoreRitualLoader({ previewImageUrl }: LoreRitualLoaderProps) {
  return (
    <div className="specimen-upload" role="status" aria-live="polite" aria-atomic="true">
      <div className="specimen-upload__mount" aria-hidden="true">
        {previewImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewImageUrl} alt="" className="specimen-upload__photo" />
        ) : (
          <Leaf className="specimen-upload__leaf" strokeWidth={1.25} />
        )}
        <div className="specimen-upload__embers"><i /><i /><i /><i /><i /></div>
        <span className="specimen-upload__seal"><Leaf size={24} strokeWidth={1.5} /></span>
      </div>
      <h2>{previewImageUrl ? "The wood remembers" : "An offering to the wood"}</h2>
      <p>{previewImageUrl
        ? "Your offering rests among the leaves. Wait a moment while the spirit seeks the tales it carries."
        : "Hold a moment, wayfarer. Your glimpse of the living world is taking its place in the lorebook."}</p>

    </div>
  );
}
