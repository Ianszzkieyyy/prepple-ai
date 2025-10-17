"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RESUME_BUCKET = "resumes";

interface JoinRoomFormProps extends React.ComponentPropsWithoutRef<"div"> {
    roomId?: string;
}

export function JoinRoomForm({
  className,
  roomId,
  ...props
}: JoinRoomFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!resumeFile) {
      setError("Please upload your resume before joining.");
      return;
    }
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Authentication required. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      const fileExt = resumeFile.name.split(".").pop();
      const fileName = `${user.id}-${crypto.randomUUID()}${fileExt ? `.${fileExt}` : ""}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(filePath, resumeFile, {
          upsert: false,
          contentType: resumeFile.type || "application/octet-stream",
        });

      if (uploadError) {
        setError(uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const {
        data: { publicUrl: resumeUrl },
      } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(filePath);

      const candidateId = crypto.randomUUID();

      const { error: insertError } = await supabase.from("candidates").insert({
        id: candidateId,
        user_id: user.id,
        resume_url: resumeUrl,
        applied_room: roomId,
      });

      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }

      router.push(`/client/interview/${roomId}/live?candidateId=${candidateId}`);
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Something went wrong. Try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Join an Interview Room</CardTitle>
          <CardDescription>
            Upload your resume to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="resume-file">Upload Resume (PDF preferred)</Label>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setResumeFile(event.target.files?.[0] ?? null)
                }
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}