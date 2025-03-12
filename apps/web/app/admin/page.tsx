"use client";

import { useState, useEffect, JSX } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import BackgroundAnimation from "@/components/background-animation";
import { Shield } from "lucide-react";

interface Secret {
  id: string;
  content: string;
  createdAt: string;
  expiryTime: string;
  isPasswordProtected: boolean;
  history: {
    content: string;
    createdAt: string;
  }[];
}

export default function AdminPage(): JSX.Element {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminAuthenticated') === 'true';
    }
    return false;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleLogin = () => {
    if (username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      fetchSecrets();
      toast({
        title: "Success",
        description: "Logged in successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSecrets();
    }
  }, [isAuthenticated]);

  const fetchSecrets = async () => {
    try {
      const response = await fetch('/api/secrets?isAdmin=true');
      const data = await response.json();
      if (response.ok) {
        setSecrets(data.secrets);
      }
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch secrets",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <BackgroundAnimation />
      <div className="container mx-auto py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Admin Dashboard</h1>
          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem('adminAuthenticated');
              }}
            >
              Logout
            </Button>
          )}
        </div>
        
        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto backdrop-blur-sm bg-background/80">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-center">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className="backdrop-blur-sm bg-background/80">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Content Preview</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Password Protected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {secrets.map((secret) => (
                  <TableRow key={secret.id}>
                    <TableCell className="font-mono">{secret.id}</TableCell>
                    <TableCell className="max-w-md truncate">{secret.content}</TableCell>
                    <TableCell>{formatDate(secret.createdAt)}</TableCell>
                    <TableCell>{formatDate(secret.expiryTime)}</TableCell>
                    <TableCell>{secret.isPasswordProtected ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="mr-2" onClick={() => setSelectedSecret(secret)}>
                            View Content
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-md">
                          <DialogHeader>
                            <DialogTitle>Secret Content</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <pre className="bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[60vh] font-mono text-sm">
                              {secret.content}
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedSecret(secret)}>
                            History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-md">
                          <DialogHeader>
                            <DialogTitle>Secret History</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="mt-4 max-h-[60vh]">
                            {secret.history.map((entry, index) => (
                              <div key={index} className="mb-4 p-4 border rounded-lg bg-secondary/30">
                                <div className="text-sm text-muted-foreground mb-2">
                                  {formatDate(entry.createdAt)}
                                </div>
                                <pre className="bg-secondary/50 p-4 rounded-lg overflow-auto font-mono text-sm">
                                  {entry.content}
                                </pre>
                              </div>
                            ))}
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}