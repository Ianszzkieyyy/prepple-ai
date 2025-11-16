"use client";

import { useState, type FormEvent } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { X } from "lucide-react";

const roomSchema = z
  .object({
    title: z.string().trim().min(1, "Room title is required").max(120),
    jobPosting: z
      .string()
      .trim()
      .min(1, "Job posting is required")
      .max(3000, "Maximum 3000 characters"),
    interviewType: z.enum(["general", "technical", "custom"], {
      errorMap: () => ({ message: "Select an interview type" }),
    }),
    idealLength: z
      .number()
      .min(3, "Minimum length is 3 minutes")
      .max(10, "Maximum length is 10 minutes"),
    startDate: z.date({ error: "Start date is required" }),
    endDate: z.date({ error: "End date is required" }),
    aiInstructions: z
      .string()
      .trim()
      .max(200, "Maximum 200 characters")
      .optional(),
    customParameters: z.array(
      z.object({
        paramName: z.string().min(2, "Parameter name must be at least 2 characters").max(50, "Parameter name must be at most 50 characters"),
        paramType: z.enum(["string", "number", "boolean"]),
        paramDescription: z.string().max(200, "Parameter description must be at most 200 characters"),
      })
    ).max(5, "Maximum 5 custom parameters allowed").optional()
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      path: ["endDate"],
      message: "End date must be on or after the start date",
    },
  );

type RoomFormValues = z.infer<typeof roomSchema>;

export function CreateRoomForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [title, setTitle] = useState("");
  const [jobPosting, setJobPosting] = useState("");
  const [interviewType, setInterviewType] =
    useState<RoomFormValues["interviewType"] | "">("");
  const [idealLength, setIdealLength] = useState<number>(5);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [aiInstructions, setAiInstructions] = useState("");
  const [customParameters, setCustomParameters] = useState<
    RoomFormValues["customParameters"]
  >([]);
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
    setIdealLength(5);
    setStartDate(undefined);
    setEndDate(undefined);
    setAiInstructions("");
    setCustomParameters([]);
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
      customParameters,
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

    const { error } = await supabase.from("rooms").insert({
      hr_id: user.id,
      room_title: validation.data.title,
      job_posting: validation.data.jobPosting,
      interview_type: validation.data.interviewType,
      start_date: format(validation.data.startDate, "yyyy-MM-dd"),
      end_date: format(validation.data.endDate, "yyyy-MM-dd"),
      ideal_length: validation.data.idealLength,
      room_code: generateRoomCode(),
      ai_instruction:
        validation.data.aiInstructions?.trim()
          ? validation.data.aiInstructions.trim()
          : null,
      custom_parameters: validation.data.customParameters && validation.data.customParameters.length > 0
        ? validation.data.customParameters
        : null,
    });

    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess("Room created successfully.");
      resetForm();
    }

    setIsSubmitting(false);
    router.push("/admin/rooms");
  };

  return (
    <Tabs className="py-8" defaultValue="interview">
      <TabsList className="w-xl mx-auto mb-4 ">
        <TabsTrigger value="interview">Interview</TabsTrigger>
        <TabsTrigger value="custom">Custom</TabsTrigger>
      </TabsList>
      <TabsContent value="interview">
        <div className={`${className} w-xl mx-auto`} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Create interview room</CardTitle>
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
                    <span>{jobPosting.length}/3000</span>
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
                    onValueChange={(value) => setIdealLength(value[0] ?? 5)}
                    min={3}
                    max={10}
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
                  {isSubmitting ? "Creating room..." : "Create room"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="custom">
        <div className={`${className} w-xl mx-auto`} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Create custom room</CardTitle>
              <CardDescription>
                Configure the session details for the AI interviewer. A custom room allows you to specify unique parameters for the interview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                setInterviewType("custom");
                handleSubmit(e);
              }}>
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
                  <Label htmlFor="job-posting">Interview Description</Label>
                  <Textarea
                    id="job-posting"
                    placeholder="Describe the type of assessment interview we will be conducting. Discuss objectives, key focus areas, and any specific skills or competencies to be evaluated..."
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
                    <span>{jobPosting.length}/3000</span>
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
                  <Label>Custom Parameters</Label>
                  <p className="text-sm text-muted-foreground">
                    Define up to 5 additional custom parameters for this interview room. These parameters will guide the AI interviewer on specific areas to focus during the assessment and will also show up in the candidate report. By default, the AI will assess tone analysis, performance summary, recommendations, key highlights, areas for improvement, and an overall interview score.
                  </p>
                  {customParameters && customParameters.map((param, index) => (
                    <div key={index} className="space-y-3 rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Parameter #{index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newParams = [...customParameters];
                            newParams.splice(index, 1);
                            setCustomParameters(newParams);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`param-name-${index}`}>Name</Label>
                          <Input
                            id={`param-name-${index}`}
                            placeholder="e.g., 'Problem Solving Ability'"
                            value={param.paramName}
                            onChange={(e) => {
                              const newParams = [...customParameters];
                              newParams[index] = { ...newParams[index], paramName: e.target.value };
                              setCustomParameters(newParams);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`param-type-${index}`}>Type</Label>
                          <Select
                            value={param.paramType}
                            onValueChange={(value: "string" | "number" | "boolean") => {
                              const newParams = [...customParameters];
                              newParams[index] = { ...newParams[index], paramType: value };
                              setCustomParameters(newParams);
                            }}
                          >
                            <SelectTrigger id={`param-type-${index}`}>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`param-desc-${index}`}>Description</Label>
                        <Textarea
                          id={`param-desc-${index}`}
                          placeholder="e.g., 'How effectively the candidate approaches and solves problems during the interview.'"
                          value={param.paramDescription}
                          onChange={(e) => {
                            const newParams = [...customParameters];
                            newParams[index] = { ...newParams[index], paramDescription: e.target.value };
                            setCustomParameters(newParams);
                          }}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (customParameters && customParameters.length < 5) {
                        setCustomParameters([
                          ...(customParameters || []),
                          { paramName: "", paramType: "string", paramDescription: "" },
                        ]);
                      }
                    }}
                    disabled={!customParameters || customParameters.length >= 5}
                  >
                    Add Parameter
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Ideal interview length: {idealLength} min</Label>
                  <Slider
                    value={[idealLength]}
                    onValueChange={(value) => setIdealLength(value[0] ?? 5)}
                    min={3}
                    max={10}
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
                  {isSubmitting ? "Creating room..." : "Create room"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function generateRoomCode() {
  return crypto.randomUUID().split("-")[0].toUpperCase();
}
