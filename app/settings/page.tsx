"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/trpc/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Key, Mail, Settings, User } from "lucide-react";

function isUTSchoolsEmail(value: string) {
  return value.trim().toLowerCase().endsWith("@utschools.ca");
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { data: me } = api.auth.me.useQuery();

  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center">
          <Settings className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold">
            {me?.name?.[0]?.toUpperCase() ?? me?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {me?.name ?? me?.email ?? "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{me?.email ?? "..."}</p>
            {me?.verified && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-success">
                <Check className="h-3 w-3" />
                Verified Student
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Email Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <Mail className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Change Email</h3>
            <p className="text-sm text-muted-foreground">
              Update your email address
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current email:{" "}
            <span className="font-medium text-foreground">
              {me?.email ?? "Unknown"}
            </span>
          </p>

          <div className="space-y-2">
            <Label htmlFor="newEmail">New email</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="you@utschools.ca"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailMessage(null);
                setEmailSuccess(false);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Email must be a valid @utschools.ca address
            </p>
          </div>

          <Button
            onClick={async () => {
              setEmailMessage(null);
              setEmailSuccess(false);
              const normalizedEmail = email.trim().toLowerCase();
              if (!isUTSchoolsEmail(normalizedEmail)) {
                setEmailMessage("Email must end with @utschools.ca.");
                return;
              }
              const { error } = await supabase.auth.updateUser({
                email: normalizedEmail,
              });
              if (error) {
                setEmailMessage(error.message);
                return;
              }
              setEmailSuccess(true);
              setEmailMessage("Check your inbox to confirm the email change.");
            }}
            disabled={!email}
          >
            Update Email
          </Button>

          {emailMessage && (
            <p
              className={`text-sm ${emailSuccess ? "text-success" : "text-destructive"}`}
            >
              {emailMessage}
            </p>
          )}
        </div>
      </div>

      {/* Password Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <Key className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Update your account password
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordMessage(null);
                setPasswordSuccess(false);
              }}
            />
          </div>

          <Button
            onClick={async () => {
              setPasswordMessage(null);
              setPasswordSuccess(false);
              const { error } = await supabase.auth.updateUser({ password });
              if (error) {
                setPasswordMessage(error.message);
                return;
              }
              setPassword("");
              setPasswordSuccess(true);
              setPasswordMessage("Password updated successfully.");
            }}
            disabled={password.length < 8}
          >
            Update Password
          </Button>

          {passwordMessage && (
            <p
              className={`text-sm ${passwordSuccess ? "text-success" : "text-destructive"}`}
            >
              {passwordMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
