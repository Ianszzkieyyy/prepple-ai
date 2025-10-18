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
import { cn } from "@/lib/utils";

export function JoinRoomCode({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!roomCode.trim()) {
      setError("Room code is required.");
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { data, error: queryError } = await supabase
      .from("rooms")
      .select("id")
      .eq("room_code", roomCode.toUpperCase())
      .single();

    if (queryError || !data) {
      setError("Invalid room code. Please check the code and try again.");
      setIsSubmitting(false);
      return;
    }

    // Redirect to the interview room page, e.g., /interview/[roomId]
    router.push(`/client/interview/${data.id}/join`);
  };

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Join an Interview Room</CardTitle>
          <CardDescription>
            Enter the room code provided by the HR manager to start your
            interview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="room-code">Room Code</Label>
              <Input
                id="room-code"
                placeholder="ABC123DE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
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