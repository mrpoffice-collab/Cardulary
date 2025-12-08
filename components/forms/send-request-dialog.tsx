"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
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
  guestToken: string;
}

export default function SendRequestDialog({
  eventId,
  guestId,
  guestName,
  guestEmail,
  eventName,
  organizerName,
  eventType,
  guestToken,
}: SendRequestDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<"warm_casual" | "polite_formal" | "playful">("warm_casual");

  const canSendEmail = !!guestEmail;

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

  const handleCopyMessage = async () => {
    try {
      const submissionLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://cardulary.vercel.app'}/submit/${guestToken}`;

      // Create a beautiful formatted message
      const beautifulMessage = `Hi there!

I'm collecting mailing addresses for ${eventName}. Would you mind taking a quick moment to share yours?

Click here to submit your address:
${submissionLink}

It'll take less than a minute, I promise!

---
Your information is private and will only be used for ${eventName}. I won't share it with anyone else.

Thank you!`;

      await navigator.clipboard.writeText(beautifulMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy message");
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
            Send an email or copy the link to share manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Status */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="font-medium">Email</div>
            <div className="text-sm text-gray-600">
              {guestEmail || "No email available - use Copy Link to share manually"}
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
            {aiLoading ? "Generating..." : "Generate AI Message"}
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
              Use {"{firstName}"} to personalize. The submission link will be automatically included.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyMessage}
            disabled={copied}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link & Message
              </>
            )}
          </Button>
          <div className="flex gap-2 flex-1 sm:flex-initial">
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
              disabled={loading || !message || !canSendEmail}
            >
              {loading ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
