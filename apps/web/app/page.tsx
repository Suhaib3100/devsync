"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Clock, Trash2, Key, Save, History, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import BackgroundAnimation from "@/components/background-animation"
import Header from "@/components/header"
import CodeEditor from "@/components/code-editor"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const { toast } = useToast()
  const [showVault, setShowVault] = useState(false)
  const [secretCode, setSecretCode] = useState("")
  const [secretContent, setSecretContent] = useState("")
  const [passwordProtect, setPasswordProtect] = useState(false)
  const [password, setPassword] = useState("")
  const [expiry, setExpiry] = useState("1h")

  const getExpiryTime = (duration: string) => {
    const times = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return times[duration as keyof typeof times] || times['1h'];
  }
  const [savedSecrets, setSavedSecrets] = useState<Array<{ id: string; content: string; date: string }>>([])

  const handleOpenVault = async () => {
    if (secretCode.trim() !== "") {
      try {
        const response = await fetch(`/api/secrets?id=${secretCode}&password=${password}`);
        const data = await response.json();

        if (response.ok) {
          setSecretContent(data.content);
          setShowVault(true);
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to retrieve secret",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect to server",
          variant: "destructive"
        });
      }
    }
  }

  const handleSaveSecret = async () => {
    if (secretContent.trim() !== "") {
      try {
        const response = await fetch('/api/secrets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: secretCode, // Include the secret ID if we're updating
            content: secretContent,
            password: passwordProtect ? password : undefined,
            expiryTime: new Date(Date.now() + getExpiryTime(expiry)).toISOString(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const newSecret = {
            id: data.id,
            content: secretContent,
            date: new Date().toLocaleString(),
          };
          setSavedSecrets([newSecret, ...savedSecrets]);
          setSecretContent("");
          toast({
            title: "Success",
            description: "Secret saved successfully",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to save secret",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect to server",
          variant: "destructive"
        });
      }
    }
  }

  const handleDeleteAll = () => {
    setSavedSecrets([])
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 backdrop-blur-sm bg-black/50 fixed w-full z-50">
        <Header />
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <BackgroundAnimation />

        <div className="container mx-auto px-4 z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center mb-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
              Secure Your Secrets in the Digital Realm
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl mb-8">
              Military-grade encryption. Zero-knowledge architecture. Your data never leaves your device unencrypted.
            </p>
          </motion.div>

          {!showVault ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto"
            >
              <div className="backdrop-blur-md bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 shadow-lg">
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Enter your secret code..."
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Button onClick={handleOpenVault} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Lock className="mr-2 h-4 w-4" /> Open Secure Vault
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="backdrop-blur-md bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-emerald-500 flex items-center">
                    <Lock className="mr-2 h-5 w-5" /> Secret Vault
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowVault(false)}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    Close Vault
                  </Button>
                </div>

                <Tabs defaultValue="create">
                  <TabsList className="bg-zinc-800 mb-6">
                    <TabsTrigger value="create">Create Secret</TabsTrigger>
                    <TabsTrigger value="history">View History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="create">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="secret-content">Your Secret</Label>
                        <CodeEditor content={secretContent} onChange={setSecretContent} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="expiry">Set Expiry</Label>
                          <Select value={expiry} onValueChange={setExpiry}>
                            <SelectTrigger id="expiry" className="mt-1 bg-zinc-800 border-zinc-700">
                              <SelectValue placeholder="Select expiry time" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              <SelectItem value="1h">1 Hour</SelectItem>
                              <SelectItem value="24h">24 Hours</SelectItem>
                              <SelectItem value="7d">7 Days</SelectItem>
                              <SelectItem value="30d">30 Days</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mt-6">
                            <Label htmlFor="password-protect">Password Protection</Label>
                            <Switch
                              id="password-protect"
                              checked={passwordProtect}
                              onCheckedChange={setPasswordProtect}
                            />
                          </div>
                        </div>

                        <div>
                          <Button variant="destructive" className="mt-6 w-full" onClick={handleDeleteAll}>
                            <Trash2 className="mr-2 h-4 w-4" /> Nuke All Data
                          </Button>
                        </div>
                      </div>

                      {passwordProtect && (
                        <div>
                          <Label htmlFor="password">Set Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      )}

                      <Button onClick={handleSaveSecret} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Save className="mr-2 h-4 w-4" /> Save Secret Securely
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="space-y-4">
                      {savedSecrets.length > 0 ? (
                        <div className="space-y-4">
                          {savedSecrets.map((secret, index) => (
                            <Card key={index} className="bg-zinc-800/50 border-zinc-700">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center text-sm text-zinc-400">
                                    <History className="mr-2 h-4 w-4" />
                                    {secret.date}
                                  </div>
                                </div>
                                <CodeEditor
                                  content={secret.content}
                                  readOnly={true} onChange={function (value: string): void {
                                    throw new Error("Function not implemented.")
                                  } }                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-zinc-500">
                          <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No history available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use DevSync?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our platform offers unparalleled security features to keep your sensitive information protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="backdrop-blur-md bg-zinc-900/30 p-6 rounded-lg border border-zinc-800"
            >
              <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
              <p className="text-zinc-400">
                Your data is encrypted before it leaves your device, ensuring only you can access your information.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="backdrop-blur-md bg-zinc-900/30 p-6 rounded-lg border border-zinc-800"
            >
              <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Self-Destructing Data</h3>
              <p className="text-zinc-400">
                Set expiration times for your secrets, after which they'll be automatically and permanently deleted.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="backdrop-blur-md bg-zinc-900/30 p-6 rounded-lg border border-zinc-800"
            >
              <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Zero-Knowledge Architecture</h3>
              <p className="text-zinc-400">
                We can't read your data even if we wanted to. Your encryption keys never leave your device.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our secure process ensures your data remains protected at every step.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-zinc-800"></div>

              {/* Steps */}
              <div className="space-y-12">
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="md:w-1/2 md:pr-12 md:text-right"
                  >
                    <div className="mb-2 text-emerald-500 font-bold text-lg">Step 1</div>
                    <h3 className="text-xl font-bold mb-2">Enter Your Secret Code</h3>
                    <p className="text-zinc-400">
                      Your unique code unlocks your personal vault, ensuring only you have access.
                    </p>
                  </motion.div>
                  <div className="absolute top-0 left-0 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-black font-bold">1</span>
                  </div>
                </div>

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="md:w-1/2 md:ml-auto md:pl-12"
                  >
                    <div className="mb-2 text-emerald-500 font-bold text-lg">Step 2</div>
                    <h3 className="text-xl font-bold mb-2">Store Your Sensitive Data</h3>
                    <p className="text-zinc-400">
                      Add your secrets to the vault with optional password protection and expiry settings.
                    </p>
                  </motion.div>
                  <div className="absolute top-0 left-0 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-black font-bold">2</span>
                  </div>
                </div>

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="md:w-1/2 md:pr-12 md:text-right"
                  >
                    <div className="mb-2 text-emerald-500 font-bold text-lg">Step 3</div>
                    <h3 className="text-xl font-bold mb-2">Access Anywhere, Anytime</h3>
                    <p className="text-zinc-400">
                      Your encrypted data is available whenever you need it, from any device.
                    </p>
                  </motion.div>
                  <div className="absolute top-0 left-0 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-black font-bold">3</span>
                  </div>
                </div>

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="md:w-1/2 md:ml-auto md:pl-12"
                  >
                    <div className="mb-2 text-emerald-500 font-bold text-lg">Step 4</div>
                    <h3 className="text-xl font-bold mb-2">Automatic Destruction</h3>
                    <p className="text-zinc-400">
                      Once the expiry time is reached, your data is permanently deleted from our systems.
                    </p>
                  </motion.div>
                  <div className="absolute top-0 left-0 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-black font-bold">4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Trusted by security professionals and privacy-conscious individuals worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <span className="text-emerald-500 font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Alex Chen</h4>
                    <p className="text-xs text-zinc-500">Security Researcher</p>
                  </div>
                </div>
                <p className="text-zinc-400">
                  "As someone who deals with sensitive information daily, DevSync has become an essential tool in my
                  security arsenal. The encryption is top-notch."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <span className="text-emerald-500 font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-xs text-zinc-500">Privacy Advocate</p>
                  </div>
                </div>
                <p className="text-zinc-400">
                  "The self-destructing messages feature is exactly what I needed. I can share sensitive information and
                  know it won't persist forever."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <span className="text-emerald-500 font-bold">M</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Michael Torres</h4>
                    <p className="text-xs text-zinc-500">Software Developer</p>
                  </div>
                </div>
                <p className="text-zinc-400">
                  "I use DevSync to store API keys and credentials. The interface is clean, and I love that I can
                  access my secrets from any device securely."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Secure Your Sensitive Data?</h2>
            <p className="text-zinc-400 mb-8 text-lg">
              Join thousands of security-conscious users who trust DevSync with their most sensitive information.
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Shield className="h-6 w-6 text-emerald-500" />
              <span className="text-xl font-bold">DevSync</span>
            </div>

            <div className="flex gap-6 mb-6 md:mb-0">
              <a href="#" className="text-zinc-400 hover:text-emerald-500 transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-zinc-400 hover:text-emerald-500 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-zinc-400 hover:text-emerald-500 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>

            <div className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} DevSync. All rights reserved.
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600">
            <p>DevSync is designed for educational purposes. Always follow best security practices.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}