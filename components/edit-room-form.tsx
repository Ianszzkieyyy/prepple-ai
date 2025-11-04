"use client";

import React, { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RoomType } from "@/lib/types";

const roomSchema = z
  .object({
    title: z.string().trim().min(1, "Room title is required").max(120),
    jobPosting: z
      .string()
      .trim()
      .min(1, "Job posting is required")
      .max(3000, "Maximum 3000 characters"),
    interviewType: z.enum(["general", "technical"], {
      errorMap: () => ({ message: "Select an interview type" }),
    }),
    idealLength: z
      .number()
      .min(3, "Minimum length is 3 minutes")
      .max(5, "Maximum length is 5 minutes"),
    startDate: z.date({ error: "Start date is required" }),
    endDate: z.date({ error: "End date is required" }),
    aiInstructions: z
      .string()
      .trim()
      .max(200, "Maximum 200 characters")
      .optional(),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      path: ["endDate"],
      message: "End date must be on or after the start date",
    },
  );

type RoomFormValues = z.infer<typeof roomSchema>;

interface EditRoomFormProps extends React.ComponentPropsWithoutRef<"div"> {
    roomData: RoomType,
}

export function EditRoomForm({
  className,
  roomData,
  ...props
}: EditRoomFormProps) {
  const [title, setTitle] = useState(roomData.room_title);
  const [jobPosting, setJobPosting] = useState(roomData.job_posting);
  const [interviewType, setInterviewType] = useState<
    RoomFormValues["interviewType"] | ""
  >(roomData.interview_type as RoomFormValues["interviewType"]);
  const [idealLength, setIdealLength] = useState<number>(roomData.ideal_length || 4);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(roomData.start_date || ""));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(roomData.end_date || ""));
  const [aiInstructions, setAiInstructions] = useState(roomData.ai_instruction || "");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RoomFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const resetForm = () => {
    setTitle("");
    setJobPosting("");
    setInterviewType("");
    setIdealLength(4);
    setStartDate(undefined);
    setEndDate(undefined);
    setAiInstructions("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    setFieldErrors({});

    const validation = roomSchema.safeParse({
      title,
      jobPosting,
      interviewType,
      idealLength,
      startDate,
      endDate,
      aiInstructions,
    });

    if (!validation.success) {
      const formFieldErrors: Partial<Record<keyof RoomFormValues, string>> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof RoomFormValues | undefined;
        if (path) formFieldErrors[path] = issue.message;
      });
      setFieldErrors(formFieldErrors);
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setFormError("Authentication required to create a room.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("rooms").update({
      hr_id: user.id,
      room_title: validation.data.title,
      job_posting: validation.data.jobPosting,
      interview_type: validation.data.interviewType,
      start_date: format(validation.data.startDate, "yyyy-MM-dd"),
      end_date: format(validation.data.endDate, "yyyy-MM-dd"),
      ideal_length: validation.data.idealLength,
      room_code: roomData.room_code,
      ai_instruction:
        validation.data.aiInstructions?.trim()
          ? validation.data.aiInstructions.trim()
          : null,
    }).eq("id", roomData.id)

    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess("Room updated successfully.");
      router.push(`admin/rooms/${roomData.id}`);
    }

    setIsSubmitting(false);
  };

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Edit interview room</CardTitle>
          <CardDescription>
            Configure the session details for the AI interviewer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="room-title">Room title</Label>
              <Input
                id="room-title"
                placeholder="Frontend Hiring Sprint"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500">{fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-posting">Job posting</Label>
              <Textarea
                id="job-posting"
                placeholder="Describe the role, expectations, and key responsibilities..."
                value={jobPosting}
                onChange={(event) => setJobPosting(event.target.value)}
                maxLength={3000}
                rows={6}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {fieldErrors.jobPosting ? (
                  <span className="text-red-500">
                    {fieldErrors.jobPosting}
                  </span>
                ) : (
                  <span />
                )}
                <span>{jobPosting?.length}/3000</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-instructions">Additional AI instructions</Label>
              <Textarea
                id="ai-instructions"
                placeholder="Add optional guidance for the AI interviewer (e.g. tone, topics to stress)..."
                value={aiInstructions}
                onChange={(event) => setAiInstructions(event.target.value)}
                maxLength={200}
                rows={3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {fieldErrors.aiInstructions ? (
                  <span className="text-red-500">{fieldErrors.aiInstructions}</span>
                ) : (
                  <span />
                )}
                <span>{aiInstructions.length}/200</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-type">Interview type</Label>
              <Select
                value={interviewType || undefined}
                onValueChange={(value: RoomFormValues["interviewType"]) =>
                  setInterviewType(value)
                }
              >
                <SelectTrigger id="interview-type">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.interviewType && (
                <p className="text-sm text-red-500">
                  {fieldErrors.interviewType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ideal interview length: {idealLength} min</Label>
              <Slider
                value={[idealLength]}
                onValueChange={(value) => setIdealLength(value[0] ?? 4)}
                min={3}
                max={5}
                step={1}
              />
              {fieldErrors.idealLength && (
                <p className="text-sm text-red-500">
                  {fieldErrors.idealLength}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => (endDate ? date > endDate : false)}
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.startDate && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>End date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.endDate && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-500">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-sm text-green-600">{formSuccess}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating room..." : "Update room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

