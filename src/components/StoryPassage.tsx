import { EncounterResponse } from "@/types/game";

export default function StoryPassage({ encounter }: { encounter: EncounterResponse }) {
  return (
    <article className="story-passage">
      <h2>{encounter.story.title}</h2>
      <div className="story-passage__prose">
        {encounter.story.narrative.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
      <blockquote>
        <p>{encounter.story.spiritPrompt}</p>
        <cite>The Spirit of the Wood</cite>
      </blockquote>
      <details className="story-passage__lore">
        <summary>The old tale behind this encounter</summary>
        <h3>{encounter.folklore.title}</h3>
        <p>{encounter.folklore.loreText}</p>
        <p className="story-passage__tradition">{encounter.folklore.tradition}</p>
      </details>
    </article>
  );
}
