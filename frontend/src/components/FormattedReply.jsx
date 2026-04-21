export function FormattedReply({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" ").trim(),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({
      type: "list",
      items: [...listItems],
    });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    const markdownHeadingMatch = line.match(/^#{1,6}\s+(.*)$/);

    if (numberedMatch) {
      flushParagraph();
      listItems.push(numberedMatch[2]);
      continue;
    }

    if (bulletMatch) {
      flushParagraph();
      listItems.push(bulletMatch[1]);
      continue;
    }

    if (markdownHeadingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        title: markdownHeadingMatch[1],
        content: "",
      });
      continue;
    }

    const headingMatch = line.match(/^([A-Za-z][A-Za-z\s]{1,40}):\s*(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        title: headingMatch[1],
        content: headingMatch[2],
      });
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  if (!blocks.length) {
    return <div className="whitespace-pre-wrap break-words leading-7">{text}</div>;
  }

  return (
    <div className="space-y-4 break-words leading-7">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <section
              key={`${block.type}-${index}`}
              className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm"
            >
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accentDark">
                {block.title}
              </h4>
              {block.content ? <p className="mt-2 text-[15px] text-slate-700">{block.content}</p> : null}
            </section>
          );
        }

        if (block.type === "list") {
          return (
            <ol
              key={`${block.type}-${index}`}
              className="space-y-3 rounded-2xl bg-white/70 px-4 py-4 text-[15px] text-slate-700"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                    {itemIndex + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-[15px] text-slate-700">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
