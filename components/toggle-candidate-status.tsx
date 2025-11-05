"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toCapitalized from "@/lib/toCapitalized"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function ToggleCandidateStatus({ candidateId }: { candidateId: string }) {
    const [status, setStatus] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCandidateStatus = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("candidates")
                .select("candidate_status")
                .eq("id", candidateId)
                .single();

            if (error) {
                console.error("Error fetching candidate status:", error);
            } else {
                setStatus(data?.candidate_status);
            }
        };

        fetchCandidateStatus();
    }, [candidateId]);

    const updateCandidateStatus = async (newStatus: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("candidates")
            .update({ candidate_status: newStatus })
            .eq("id", candidateId);

        if (error) {
            console.error("Error updating candidate status:", error);
        } else {
            setStatus(newStatus);
        }

        router.refresh();
    };

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-8">
                    {status ? toCapitalized(status) : "Loading..."}
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={status || ""} onValueChange={(value) => updateCandidateStatus(value)}>
                    <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="accepted">Accepted</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}