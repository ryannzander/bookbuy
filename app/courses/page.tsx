"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, Trash2, BookOpen, Sparkles, TrendingUp } from "lucide-react";

export default function CoursesPage() {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [semester, setSemester] = useState("");

  const { data: myCourses } = api.course.myCourses.useQuery();
  const { data: suggested } = api.course.suggestedBooks.useQuery();
  const { data: popular } = api.course.popularCourses.useQuery();
  const utils = api.useUtils();

  const addCourse = api.course.addCourse.useMutation({
    onSuccess: () => {
      utils.course.myCourses.invalidate();
      utils.course.suggestedBooks.invalidate();
      setCourseCode("");
      setCourseName("");
      setSemester("");
    },
  });
  const removeCourse = api.course.removeCourse.useMutation({
    onSuccess: () => {
      utils.course.myCourses.invalidate();
      utils.course.suggestedBooks.invalidate();
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Add your courses to get textbook suggestions</p>
        </div>
      </div>

      {/* Add Course Form */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add a Course
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!courseCode.trim()) return;
            addCourse.mutate({ courseCode, courseName: courseName || undefined, semester: semester || undefined });
          }}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="space-y-1 flex-1 min-w-[120px]">
            <Label className="text-xs">Course Code *</Label>
            <Input placeholder="MATH 221" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <Label className="text-xs">Course Name</Label>
            <Input placeholder="Calculus II" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
          </div>
          <div className="space-y-1 w-32">
            <Label className="text-xs">Semester</Label>
            <Input placeholder="Fall 2026" value={semester} onChange={(e) => setSemester(e.target.value)} />
          </div>
          <Button type="submit" disabled={!courseCode.trim() || addCourse.isPending}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </form>
      </div>

      {/* My Courses List */}
      {myCourses && myCourses.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your Schedule</h2>
          <div className="divide-y divide-border">
            {myCourses.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-mono font-semibold text-foreground">{c.courseCode}</span>
                  {c.courseName && <span className="text-muted-foreground ml-2">{c.courseName}</span>}
                  {c.semester && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {c.semester}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeCourse.mutate({ id: c.id })}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Books */}
      {suggested && suggested.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Suggested Textbooks
          </h2>
          <p className="text-sm text-muted-foreground">Based on your course schedule</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {suggested.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="rounded-xl border border-border p-4 hover:border-muted-foreground/30 transition-colors"
              >
                <h3 className="font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{listing.author}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold">${Number(listing.price)}</span>
                  {listing.courseCode && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
                      {listing.courseCode}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{listing.condition}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Courses */}
      {popular && popular.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Popular Courses
          </h2>
          <div className="flex flex-wrap gap-2">
            {popular.map((c) => (
              <Link
                key={c.courseCode}
                href={`/marketplace?courseCode=${encodeURIComponent(c.courseCode)}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:border-muted-foreground/50 transition-colors text-sm"
              >
                <span className="font-mono font-medium text-foreground">{c.courseCode}</span>
                <span className="text-xs text-muted-foreground">{c.count} books</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
