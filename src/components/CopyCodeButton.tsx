"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";

const CopyCodeButton = () => {
  const [copied, setCopied] = useState(false);
  const { getCode } = useCodeEditorStore();

  const handleCopyCode = async () => {
    const code = getCode();
    if (!code.trim()) {
      toast.error("No code to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCopyCode}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy Code</span>
        </>
      )}
    </motion.button>
  );
};

export default CopyCodeButton;