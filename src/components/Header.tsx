import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { LogTimeModal } from "@/components/LogTimeModal";

export function Header() {
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <SidebarTrigger />
      <Button onClick={() => setIsLogTimeOpen(true)} className="gap-2">
        <Clock className="h-4 w-4" />
        Log Time
      </Button>
      <LogTimeModal open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen} />
    </header>
  );
}
