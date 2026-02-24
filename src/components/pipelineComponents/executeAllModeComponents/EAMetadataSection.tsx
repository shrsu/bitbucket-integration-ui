import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

type Version = string | { name?: string };

interface DependencyMetadata {
  name: string;
  selectedVersion: string;
  versions: Version[];
  ticketNo: string;
  newBranch?: string;
  prFromBranch?: string;
  updateFileBranch?: string;
  commitMessage?: string;
  pullRequestTitle?: string;
  pullRequestDescription?: string;
}

interface Props {
  dependency: DependencyMetadata;
  onChange: (field: keyof DependencyMetadata, value: string) => void;
}

const EAMetadataSection: React.FC<Props> = ({ dependency, onChange }) => {
  const handleVersionChange = (val: string) => {
    onChange("selectedVersion", val);

    const depName = dependency.name;
    onChange("commitMessage", `Upgrade ${depName} to ${val}`);
    onChange("pullRequestTitle", `Upgrade ${depName} to ${val}`);
    onChange(
      "pullRequestDescription",
      `This PR upgrades the dependency **${depName}** to version **${val}**.`
    );
  };

  const handleTicketNoChange = (val: string) => {
    onChange("ticketNo", val);
    const branch = `feature/${val}`;
    onChange("newBranch", branch);
    onChange("prFromBranch", branch);
    onChange("updateFileBranch", branch);
  };

  return (
    <div className="grid gap-x-12 my-3 gap-y-4 w-fit">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="font-bold w-28 shrink-0">Version:</label>
        <Select
          value={dependency.selectedVersion}
          onValueChange={handleVersionChange}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent className="max-h-60 p-2 overflow-y-auto">
            <SelectGroup>
              <SelectLabel>Available versions</SelectLabel>
              {dependency.versions.slice(1).map((ver, idx) => {
                const versionLabel =
                  typeof ver === "string" ? ver : ver.name || `ver-${idx}`;
                return (
                  <SelectItem key={versionLabel} value={versionLabel}>
                    {versionLabel}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="font-bold w-28 shrink-0">Ticket No:</label>
        <Input
          value={dependency.ticketNo}
          onChange={(e) => handleTicketNoChange(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>
    </div>
  );
};

export default EAMetadataSection;
