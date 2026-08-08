import { Fragment, type ReactNode } from "react";

/**
 * Minimale opmaak binnen een alinea: *cursief* en `code`. Genoeg voor de
 * teksten op deze site, en het scheelt een markdown-afhankelijkheid.
 */
export function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*([^*]+)\*|`([^`]+)`/g;

  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={key++}>{text.slice(last, match.index)}</Fragment>);
    }
    if (match[1] !== undefined) {
      nodes.push(<em key={key++}>{match[1]}</em>);
    } else {
      nodes.push(<code key={key++}>{match[2]}</code>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  }
  return nodes;
}

export function Prose({ alineas }: { alineas: string[] }) {
  return (
    <div className="prose">
      {alineas.map((alinea, i) => (
        <p key={i}>{inline(alinea)}</p>
      ))}
    </div>
  );
}
