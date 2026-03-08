"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function isUTSchoolsEmail(value: string) {
  return value.trim().toLowerCase().endsWith("@utschools.ca");
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { data: me } = api.auth.me.useQuery();

  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account email and password.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Current email: {me?.email ?? "Unknown"}</p>
          <div className="space-y-2">
            <Label htmlFor="newEmail">New email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="you@utschools.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Email must be a valid @utschools.ca address.
          </p>
          <Button
            onClick={async () => {
              setEmailMessage(null);
              const normalizedEmail = email.trim().toLowerCase();
              if (!isUTSchoolsEmail(normalizedEmail)) {
                setEmailMessage("Email must end with @utschools.ca.");
                return;
              }
              const { error } = await supabase.auth.updateUser({ email: normalizedEmail });
              if (error) {
                setEmailMessage(error.message);
                return;
              }
              setEmailMessage("Email change requested. Check your inbox to confirm.");
            }}
            disabled={!email}
          >
            Update email
          </Button>
          {emailMessage && <p className="text-sm text-muted-foreground">{emailMessage}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={async () => {
              setPasswordMessage(null);
              const { error } = await supabase.auth.updateUser({ password });
              if (error) {
                setPasswordMessage(error.message);
                return;
              }
              setPassword("");
              setPasswordMessage("Password updated.");
            }}
            disabled={password.length < 8}
          >
            Update password
          </Button>
          {passwordMessage && <p className="text-sm text-muted-foreground">{passwordMessage}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
