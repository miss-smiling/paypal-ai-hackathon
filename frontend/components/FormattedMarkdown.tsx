"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderInline = (text: string): React.ReactNode[] => {
    // Splits by inline code, bold, italic
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return (
          <code
            key={i}
            className="rounded-md bg-indigo-50/80 border border-indigo-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-indigo-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return (
          <em key={i} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Parse text into block chunks (code blocks, tables, lists, headings, paragraphs)
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let codeBlockCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Fenced Code Block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const fullCode = codeLines.join("\n");
      const blockId = codeBlockCount++;

      blocks.push(
        <div key={`code-${i}`} className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 text-[10px] text-slate-400 font-mono border-b border-slate-700/60">
            <span>{lang || "code"}</span>
            <button
              type="button"
              onClick={() => handleCopy(fullCode, blockId)}
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              {copiedIndex === blockId ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed text-slate-200 font-mono">
            <code>{fullCode}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Markdown Tables
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        // line 1 is usually separator (|---|---|)
        const rowLines = tableLines.slice(tableLines[1].includes("-") ? 2 : 1);

        blocks.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-indigo-50/60">
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rowLines.map((rowStr, rIdx) => {
                  const cells = rowStr
                    .slice(1, -1)
                    .split("|")
                    .map((c) => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700 text-xs">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 3. Headings
    if (line.startsWith("#### ")) {
      blocks.push(
        <h4 key={`h4-${i}`} className="font-extrabold text-xs text-indigo-950 mt-2.5 mb-1 tracking-tight">
          {renderInline(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${i}`} className="font-black text-sm text-slate-900 mt-3 mb-1.5 tracking-tight">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="font-black text-base text-slate-900 mt-3.5 mb-2 tracking-tight">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // 4. Blockquotes
    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote key={`quote-${i}`} className="my-1.5 border-l-2 border-indigo-500 pl-3 italic text-slate-600 text-xs bg-slate-50/50 py-1 rounded-r-lg">
          {renderInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 5. Unordered List Items
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const listContent = line.trim().slice(2);
      blocks.push(
        <div key={`list-${i}`} className="flex items-start gap-2 my-1 text-xs text-slate-700 pl-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
          <div className="flex-1 leading-relaxed">{renderInline(listContent)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 6. Ordered List Items
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      const num = orderedMatch[1];
      const listContent = orderedMatch[2];
      blocks.push(
        <div key={`ord-${i}`} className="flex items-start gap-2 my-1 text-xs text-slate-700 pl-1">
          <span className="font-bold text-[11px] text-indigo-600 shrink-0 mt-0.5">{num}.</span>
          <div className="flex-1 leading-relaxed">{renderInline(listContent)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Regular paragraph / empty line
    if (!line.trim()) {
      blocks.push(<div key={`sp-${i}`} className="h-1.5" />);
    } else {
      blocks.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-800">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
}
