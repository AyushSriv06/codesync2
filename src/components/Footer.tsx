import { Blocks } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="relative border-t border-gray-800/50 mt-auto w-full">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
          
          {/* Left Side: Built by */}
          <div className="flex items-center gap-2 text-gray-400">
            <Blocks className="size-5" />
            <span>Built by Arpita Agrawal</span>
          </div>
          

          {/* Right Side: Links */}
          <div className="flex items-center gap-6 text-gray-400">
            <Link href="/support" className="hover:text-gray-300 transition-colors">
              Support
            </Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
