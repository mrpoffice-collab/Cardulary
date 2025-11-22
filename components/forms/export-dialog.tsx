"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExportDialogProps {
  eventId: string;
  eventName: string;
  completedCount: number;
  totalCount: number;
}

const EXPORT_FORMATS = [
  { value: "csv", label: "CSV (Generic)", icon: "📊" },
  { value: "excel", label: "Excel (.xlsx)", icon: "📗" },
  { value: "minted", label: "Minted", icon: "💌" },
  { value: "shutterfly", label: "Shutterfly", icon: "📸" },
  { value: "vistaprint", label: "Vistaprint", icon: "🖨️" },
  { value: "avery", label: "Avery Labels (sorted by ZIP)", icon: "🏷️" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Guests" },
  { value: "completed", label: "Completed Only" },
  { value: "pending", label: "Pending Only" },
  { value: "not_sent", label: "Not Sent Only" },
];

export default function ExportDialog({
  eventId,
  eventName,
  completedCount,
  totalCount,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("csv");
  const [status, setStatus] = useState("completed");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/events/${eventId}/export?format=${format}&status=${status}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${eventName}_export.csv`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Export Addresses</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Guest Addresses</DialogTitle>
          <DialogDescription>
            Download your collected addresses in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => setFormat(fmt.value)}
                  className={`p-4 border rounded-lg text-left transition ${
                    format === fmt.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{fmt.icon}</span>
                    <span className="font-medium text-sm">{fmt.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Include Guests</Label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`p-3 border rounded-lg text-left transition ${
                    status === s.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Ready to export:</strong>
              <ul className="mt-2 space-y-1">
                <li>
                  • Format: <span className="font-medium">{EXPORT_FORMATS.find(f => f.value === format)?.label}</span>
                </li>
                <li>
                  • Filter: <span className="font-medium">{STATUS_FILTERS.find(s => s.value === status)?.label}</span>
                </li>
                <li>
                  • Total guests: <span className="font-medium">{totalCount}</span>
                </li>
                <li>
                  • Completed addresses: <span className="font-medium">{completedCount}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Exporting..." : "Download Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
