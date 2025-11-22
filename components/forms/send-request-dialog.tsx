"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface SendRequestDialogProps {
  eventId: string;
  guestId: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  eventName: string;
  organizerName: string;
  eventType: string;
}

export default function SendRequestDialog({
  eventId,
  guestId,
  guestName,
  guestEmail,
  guestPhone,
  eventName,
  organizerName,
  eventType,
}: SendRequestDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<"email" | "sms">(
    guestEmail ? "email" : guestPhone ? "sms" : "email"
  );
  const [tone, setTone] = useState<"warm_casual" | "polite_formal" | "playful">("warm_casual");

  const canSendEmail = !!guestEmail;
  const canSendSMS = !!guestPhone;

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventType,
          guestFirstName: guestName.split(" ")[0],
          relationship: "friend",
          tone,
          organizerName,
        }),
      });

      if (!response.ok) {
        setError("Failed to generate message");
        setAiLoading(false);
        return;
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setError("Failed to generate message");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}/send-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestIds: [guestId],
          message,
          method,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to send request");
        setLoading(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Send Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Address Request to {guestName}</DialogTitle>
          <DialogDescription>
            Choose how to send and customize your message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Method Selection */}
          <div className="space-y-2">
            <Label>Send via</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMethod("email")}
                disabled={!canSendEmail || loading}
                className={`flex-1 p-3 border rounded-lg text-left transition ${
                  method === "email"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canSendEmail ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="font-medium">📧 Email</div>
                <div className="text-sm text-gray-600">
                  {guestEmail || "No email available"}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod("sms")}
                disabled={!canSendSMS || loading}
                className={`flex-1 p-3 border rounded-lg text-left transition ${
                  method === "sms"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canSendSMS ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="font-medium">💬 SMS</div>
                <div className="text-sm text-gray-600">
                  {guestPhone || "No phone available"}
                </div>
              </button>
            </div>
          </div>

          {/* AI Tone Selection */}
          <div className="space-y-2">
            <Label>Message Tone</Label>
            <div className="flex gap-2">
              {[
                { value: "warm_casual", label: "Warm & Casual" },
                { value: "polite_formal", label: "Polite & Formal" },
                { value: "playful", label: "Playful" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value as any)}
                  className={`px-4 py-2 border rounded-lg text-sm transition ${
                    tone === t.value
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate AI Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateAI}
            disabled={aiLoading || loading}
            className="w-full"
          >
            {aiLoading ? "Generating..." : "✨ Generate AI Message"}
          </Button>

          {/* Message Preview/Edit */}
          <div className="space-y-2">
            <Label>Message Preview</Label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Click 'Generate AI Message' or write your own..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Use {"{firstName}"} to personalize. [link] will be automatically added.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
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
          <Button
            onClick={handleSend}
            disabled={loading || !message || (!canSendEmail && !canSendSMS)}
          >
            {loading ? "Sending..." : `Send via ${method.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
