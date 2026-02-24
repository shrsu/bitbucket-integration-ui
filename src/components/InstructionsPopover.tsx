import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const instructions = [
  {
    step: "Navigate to Bitbucket",
    detail: "Go to Bitbucket → Manage Profile → HTTP Access Token",
  },
  {
    step: "Create Access Token",
    detail: "Create a new token with write access permissions",
  },
  {
    step: "Enter Credentials",
    detail: "Input your Bitbucket username and the generated access token",
  },
  {
    step: "Access Verification",
    detail:
      "An API call will verify your credentials by checking accessible projects",
  },
  {
    step: "Sidebar Enable",
    detail:
      "If credentials are valid, the buttons on the sidebar will be enabled",
  },
];

function InstructionsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hover:bg-accent"
          aria-label="Show setup instructions"
        >
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-92 p-4 ml-10">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Setup Instructions</h3>
          </div>

          <div className="space-y-3">
            {instructions.map((instruction, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">{instruction.step}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {instruction.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default InstructionsPopover;
