"use client";

import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = code.trim().split("\n");
  const showToggle = lines.length > 6;
  const displayCode = isExpanded ? code : lines.slice(0, 6).join("\n");

  return (
    <div className="relative">
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={atomOneDark}
        customStyle={{
          background: "transparent",
          fontSize: "0.875rem",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        {displayCode}
      </SyntaxHighlighter>

      {showToggle && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-sm text-blue-400 hover:underline mt-2"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CodeBlock;
