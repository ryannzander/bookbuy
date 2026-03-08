"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Users,
  BookOpen,
  Flag,
  ShoppingCart,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Search,
} from "lucide-react";

export default function AdminPage() {
  const { data: me } = api.auth.me.useQuery();
  const { data: stats, isLoading: statsLoading } = api.admin.stats.useQuery(undefined, {
    retry: false,
  });
  const [reportFilter, setReportFilter] = useState<string | undefined>(undefined);
  const [userSearch, setUserSearch] = useState("");
  const { data: reports } = api.admin.getReports.useQuery(
    { status: reportFilter as "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED" | undefined },
    { retry: false }
  );
  const { data: users } = api.admin.getUsers.useQuery(
    { search: userSearch || undefined },
    { retry: false }
  );

  const utils = api.useUtils();
  const updateReport = api.admin.updateReport.useMutation({
    onSuccess: () => {
      utils.admin.getReports.invalidate();
      utils.admin.stats.invalidate();
    },
  });
  const banUser = api.admin.banUser.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
  });
  const removeListing = api.admin.removeListing.useMutation({
    onSuccess: () => utils.admin.stats.invalidate(),
  });

  if (me && (me as { role?: string }).role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center">
          <Shield className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Moderate content and manage users</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users },
            { label: "Total Listings", value: stats.totalListings, icon: BookOpen },
            { label: "Open Reports", value: stats.openReports, icon: Flag },
            { label: "Total Sales", value: stats.totalSales, icon: ShoppingCart },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reports */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Flag className="h-5 w-5" /> Reports
          </h2>
          <div className="flex gap-2">
            {["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map((s) => (
              <button
                key={s}
                onClick={() => setReportFilter(s === "ALL" ? undefined : s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  (s === "ALL" && !reportFilter) || s === reportFilter
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {reports && reports.length === 0 && (
          <p className="text-muted-foreground py-6 text-center">No reports found.</p>
        )}

        <div className="space-y-3">
          {reports?.map((report) => (
            <div key={report.id} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium text-foreground">{report.reason}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      report.status === "OPEN" ? "bg-warning/20 text-warning" :
                      report.status === "UNDER_REVIEW" ? "bg-blue-500/20 text-blue-400" :
                      report.status === "RESOLVED" ? "bg-success/20 text-success" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                  {report.details && (
                    <p className="text-sm text-muted-foreground mt-1">{report.details}</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-2 space-x-3">
                    <span>By: {report.reporter.name ?? report.reporter.email}</span>
                    {report.targetUser && <span>Target: {report.targetUser.name ?? report.targetUser.email}</span>}
                    {report.listing && <span>Listing: {report.listing.title}</span>}
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {report.status === "OPEN" && (
                  <Button size="sm" variant="outline" onClick={() => updateReport.mutate({ reportId: report.id, status: "UNDER_REVIEW" })}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Review
                  </Button>
                )}
                {(report.status === "OPEN" || report.status === "UNDER_REVIEW") && (
                  <>
                    <Button size="sm" onClick={() => updateReport.mutate({ reportId: report.id, status: "RESOLVED" })}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateReport.mutate({ reportId: report.id, status: "DISMISSED" })}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Dismiss
                    </Button>
                  </>
                )}
                {report.listing && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Remove this listing permanently?")) {
                        removeListing.mutate({ listingId: report.listing!.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Listing
                  </Button>
                )}
                {report.targetUser && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Ban this user and remove all their listings?")) {
                        banUser.mutate({ userId: report.targetUser!.id });
                      }
                    }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Ban User
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" /> Users
          </h2>
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">User</th>
                <th className="text-left py-3 px-2 font-medium">Role</th>
                <th className="text-center py-3 px-2 font-medium">Listings</th>
                <th className="text-center py-3 px-2 font-medium">Purchases</th>
                <th className="text-center py-3 px-2 font-medium">Sales</th>
                <th className="text-left py-3 px-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === "ADMIN" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">{u._count.listings}</td>
                  <td className="py-3 px-2 text-center">{u._count.purchases}</td>
                  <td className="py-3 px-2 text-center">{u._count.sales}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
