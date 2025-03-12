"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black/80 border-t border-zinc-800 py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-zinc-400 text-sm">
              Developed with passion by{" "}
              <Link
                href="https://suhaib.protool.co.in"
                target="_blank"
                className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1"
              >
                Suhaib King
                <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
            <p className="text-zinc-500 text-xs">
              © {new Date().getFullYear()} DevSync. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/suhaib3100"
              target="_blank"
              className="text-zinc-400 hover:text-emerald-500 transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://linkedin.com/in/suhaib-sz"
              target="_blank"
              className="text-zinc-400 hover:text-emerald-500 transition-colors"
            >
              LinkedIn
            </Link>
            <Link
              href="https://twitter.com/suhaibking"
              target="_blank"
              className="text-zinc-400 hover:text-emerald-500 transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}