import "./PromptText.css";

interface ParsedPrompt {
  intro: string;
  items: string[];
}

function parsePromptText(text: string): ParsedPrompt | null {
  const lines = text.split("\n").map((line) => line.trim());
  const introParts: string[] = [];
  const items: string[] = [];
  let currentItem: string | null = null;

  for (const line of lines) {
    if (!line) continue;

    const match = line.match(/^\d+\)\s*(.*)/);
    if (match) {
      if (currentItem) items.push(currentItem);
      currentItem = match[1];
      continue;
    }

    if (currentItem !== null) {
      currentItem += ` ${line}`;
    } else {
      introParts.push(line);
    }
  }

  if (currentItem) items.push(currentItem);
  if (items.length === 0) return null;

  return { intro: introParts.join(" "), items };
}

interface PromptTextProps {
  text: string;
  className?: string;
}

export function PromptText({ text, className = "prompt-text" }: PromptTextProps) {
  const parsed = parsePromptText(text);

  if (!parsed) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className={`${className} prompt-text--structured`}>
      <p className="prompt-text__intro">{parsed.intro}</p>
      <ol className="prompt-text__list">
        {parsed.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    </div>
  );
}
