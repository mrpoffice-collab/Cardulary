"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

interface SubmissionFormProps {
  token: string;
  guestName: string;
  existingSubmission: any;
}

export default function SubmissionForm({
  token,
  guestName,
  existingSubmission,
}: SubmissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    addressLine1: existingSubmission?.addressLine1 || "",
    addressLine2: existingSubmission?.addressLine2 || "",
    city: existingSubmission?.city || "",
    state: existingSubmission?.state || "",
    zip: existingSubmission?.zip || "",
    country: existingSubmission?.country || "US",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to submit address");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <div className="text-6xl">✅</div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <p className="text-gray-600">
            Your address has been successfully submitted.
          </p>
          {existingSubmission && (
            <p className="text-sm text-gray-500">
              Your previous address has been updated.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingSubmission ? "Update Your Address" : "Enter Your Mailing Address"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Street Address *</Label>
            <Input
              id="addressLine1"
              placeholder="123 Main Street"
              value={formData.addressLine1}
              onChange={(e) =>
                setFormData({ ...formData, addressLine1: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">
              Apartment, Suite, etc. (Optional)
            </Label>
            <Input
              id="addressLine2"
              placeholder="Apt 4B"
              value={formData.addressLine2}
              onChange={(e) =>
                setFormData({ ...formData, addressLine2: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="New York"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <select
                id="state"
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
                disabled={loading}
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                placeholder="10001"
                value={formData.zip}
                onChange={(e) =>
                  setFormData({ ...formData, zip: e.target.value })
                }
                required
                maxLength={10}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading
              ? "Submitting..."
              : existingSubmission
              ? "Update Address"
              : "Submit Address"}
          </Button>

          {existingSubmission && (
            <p className="text-sm text-gray-600 text-center">
              You previously submitted your address on{" "}
              {new Date(existingSubmission.submittedAt).toLocaleDateString()}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
