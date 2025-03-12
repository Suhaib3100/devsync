"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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

export default function AdminPage(): JSX.Element {}
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleLogin = () => {
    if (username === "king" && password === "king") {
      setIsAuthenticated(true);
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
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    try {
      const response = await fetch('/api/secrets?isAdmin=true');
      const data = await response.json();
      if (response.ok) {
        setSecrets(data.secrets);
      }
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {!isAuthenticated ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleLogin}
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Card>
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
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Secret Content</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-96">
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
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Secret History</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="mt-4 max-h-96">
                          {secret.history.map((entry, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg">
                              <div className="text-sm text-muted-foreground mb-2">
                                {formatDate(entry.createdAt)}
                              </div>
                              <pre className="bg-secondary p-4 rounded-lg overflow-auto">
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
    </div>
  );
}