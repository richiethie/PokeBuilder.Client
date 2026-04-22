import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LifeBuoy, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

type FeedbackType = "feature" | "bug" | "general";

export function HelpFeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feature");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    email.trim().length > 0 &&
    message.trim().length > 0 &&
    !submitting;

  function getTypeLabel(type: FeedbackType): string {
    if (type === "feature") return "Feature Request";
    if (type === "bug") return "Bug Report";
    return "General Feedback";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !message.trim()) {
      setError("Please provide your email and message.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const from = user ? `@${user.username}` : "Guest";
      const emailSubject = `PokeBuilder ${getTypeLabel(feedbackType)}`;
      const body = [
        `From: ${from}`,
        `Reply Email: ${email.trim()}`,
        "",
        message.trim(),
      ].join("\n");

      const mailto = `mailto:support@pokebuilder.app?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" />
              Help & Feedback
            </CardTitle>
            <CardDescription>
              Send a feature request, bug report, or general feedback directly from this page.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feedback-type">Type</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                >
                  <SelectTrigger id="feedback-type" className="w-full">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feedback-email">Email</Label>
                <Input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  placeholder="you@example.com"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feedback-message">Message</Label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  maxLength={4000}
                  disabled={submitting}
                  placeholder="Describe what you need, what happened, or what would help."
                  className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Submitting opens your email app with this feedback pre-filled.
                </p>
                <Button type="submit" disabled={!canSubmit} className="gap-1.5">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
