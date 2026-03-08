"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, GraduationCap, User, ArrowRight, Check, Plus, Trash2, Sparkles } from "lucide-react";

type Step = "welcome" | "profile" | "courses" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: me } = api.auth.me.useQuery();
  const [step, setStep] = useState<Step>("welcome");
  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [courses, setCourses] = useState<{ code: string; name: string }[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");

  const updateProfile = api.auth.updateProfile.useMutation();
  const addCourse = api.course.addCourse.useMutation();
  const complete = api.auth.completeOnboarding.useMutation({
    onSuccess: () => router.replace("/dashboard"),
  });

  async function handleProfileNext() {
    if (username.trim()) {
      await updateProfile.mutateAsync({ username: username.trim(), schoolName: schoolName.trim() || undefined });
    }
    setStep("courses");
  }

  function addCourseToList() {
    if (!courseCode.trim()) return;
    setCourses((prev) => [...prev, { code: courseCode.toUpperCase().trim(), name: courseName.trim() }]);
    setCourseCode("");
    setCourseName("");
  }

  async function handleCoursesNext() {
    for (const c of courses) {
      await addCourse.mutateAsync({ courseCode: c.code, courseName: c.name || undefined });
    }
    setStep("done");
  }

  async function finish() {
    await complete.mutateAsync();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {(["welcome", "profile", "courses", "done"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full transition-colors ${
                (["welcome", "profile", "courses", "done"] as Step[]).indexOf(step) >= i
                  ? "bg-foreground" : "bg-border"
              }`} />
              {i < 3 && <div className={`h-0.5 w-8 transition-colors ${
                (["welcome", "profile", "courses", "done"] as Step[]).indexOf(step) > i
                  ? "bg-foreground" : "bg-border"
              }`} />}
            </div>
          ))}
        </div>

        {/* Welcome */}
        {step === "welcome" && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-foreground text-background flex items-center justify-center">
              <BookOpen className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to BuyBook{me?.name ? `, ${me.name.split(" ")[0]}` : ""}!</h1>
              <p className="mt-3 text-muted-foreground text-lg">Let&apos;s set up your account in under a minute.</p>
            </div>
            <div className="space-y-3 text-left">
              {[
                { icon: User, text: "Set up your profile" },
                { icon: GraduationCap, text: "Add your courses for personalized suggestions" },
                { icon: Sparkles, text: "Start browsing and listing textbooks" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                  <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="w-full gap-2" onClick={() => setStep("profile")}>
              Let&apos;s Go <ArrowRight className="h-4 w-4" />
            </Button>
            <button onClick={finish} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          </div>
        )}

        {/* Profile */}
        {step === "profile" && (
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your Profile</h2>
              <p className="mt-2 text-muted-foreground">How should other students know you?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input placeholder="e.g. jsmith" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>School Name (optional)</Label>
                <Input placeholder="e.g. University of Toronto Schools" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep("welcome")} className="flex-1">Back</Button>
              <Button size="lg" onClick={handleProfileNext} className="flex-1 gap-2" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Courses */}
        {step === "courses" && (
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your Courses</h2>
              <p className="mt-2 text-muted-foreground">Add courses to get textbook suggestions</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="MATH 221" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCourseToList()} className="flex-1" />
              <Input placeholder="Name (optional)" value={courseName} onChange={(e) => setCourseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCourseToList()} className="flex-1" />
              <Button onClick={addCourseToList} disabled={!courseCode.trim()}><Plus className="h-4 w-4" /></Button>
            </div>
            {courses.length > 0 && (
              <div className="space-y-2">
                {courses.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary">
                    <div>
                      <span className="font-mono font-semibold text-foreground">{c.code}</span>
                      {c.name && <span className="text-muted-foreground ml-2 text-sm">{c.name}</span>}
                    </div>
                    <button onClick={() => setCourses((p) => p.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setStep("profile")} className="flex-1">Back</Button>
              <Button size="lg" onClick={handleCoursesNext} className="flex-1 gap-2" disabled={addCourse.isPending}>
                {addCourse.isPending ? "Saving..." : courses.length > 0 ? "Next" : "Skip"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="h-10 w-10 text-success" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">You&apos;re all set!</h2>
              <p className="mt-3 text-muted-foreground text-lg">Your account is ready. Start browsing or list your first textbook.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button size="lg" onClick={finish} disabled={complete.isPending} className="gap-2">
                <BookOpen className="h-5 w-5" /> Browse Marketplace
              </Button>
              <Button size="lg" variant="outline" onClick={() => { finish(); router.replace("/listings/new"); }} className="gap-2">
                <Plus className="h-5 w-5" /> List a Textbook
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
