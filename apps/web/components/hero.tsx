"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <Shield className="h-12 w-12 text-emerald-500" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
              DevSync
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl md:text-2xl text-zinc-400 mb-6"
          >
            Secure & Encrypted Storage for Your Code and Text
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-zinc-500">
              Crafted with passion by{" "}
              <Link
                href="https://suhaib.protool.co.in"
                target="_blank"
                className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1 font-medium"
              >
                Suhaib King
                <ExternalLink className="h-4 w-4" />
              </Link>
            </p>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10"
                asChild
              >
                <Link href="#features">Learn More</Link>
              </Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Get Started
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent blur-2xl" />
    </div>
  )
}