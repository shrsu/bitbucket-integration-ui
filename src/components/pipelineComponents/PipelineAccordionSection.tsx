import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

import IECreateBranchesSection from "./individualExecuteModeComponents/IECreateBranchesSection";
import IECreatePullRequestsSection from "./individualExecuteModeComponents/IECreatePullRequestsSection";
import IEDependentApplicationsSection from "./individualExecuteModeComponents/IEDependentApplicationsSection";
import IEMetadataSection from "./individualExecuteModeComponents/IEMetadataSection";
import IEUpdateFilesSection from "./individualExecuteModeComponents/IEUpdateFilesSection";

import EACreateBranchesSection from "./executeAllModeComponents/EACreateBranchesSection";
import EACreatePullRequestsSection from "./executeAllModeComponents/EACreatePullRequestsSection";
import EADependentApplicationsSection from "./executeAllModeComponents/EADependentApplicationsSection";
import EAMetadataSection from "./executeAllModeComponents/EAMetadataSection";
import EAUpdateFilesSection from "./executeAllModeComponents/EAUpdateFilesSection";

import PullRequestsSection from "./PullRequestsSection";

import type { AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import type { DependentRepository } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import type { RootState } from "@/redux/store";

interface IEAccordionSectionProps {
  dependency: AddedDependency;
  handleChange: (field: keyof AddedDependency, value: any) => void;
}

const PipelineAccordionSection: React.FC<IEAccordionSectionProps> = ({
  dependency,
  handleChange,
}) => {
  const [activeItems, setActiveItems] = useState<string[]>([]);

  const dependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) =>
      state.dependentRepositories.filter(
        (repo) => repo.dependencyId === dependency.id && !!repo.prId
      )
  );

  useEffect(() => {
    const initialItems: string[] = [];
    if (dependency.isDependentApplicationsOpen)
      initialItems.push("Dependent Applications");
    if (dependency.isCreateBranchesOpen) initialItems.push("Create Branches");
    if (dependency.isUpdateFilesOpen) initialItems.push("Update Files");
    if (dependency.isCreatePullRequestsOpen)
      initialItems.push("Create Pull Requests");
    if (dependency.isPullRequestLinksOpen)
      initialItems.push("Pull Request Links");
    setActiveItems(initialItems);
  }, [dependency]);

  const handleValueChange = (values: string[]) => {
    setActiveItems(values);

    handleChange(
      "isDependentApplicationsOpen",
      values.includes("Dependent Applications")
    );
    handleChange("isCreateBranchesOpen", values.includes("Create Branches"));
    handleChange("isUpdateFilesOpen", values.includes("Update Files"));
    handleChange(
      "isCreatePullRequestsOpen",
      values.includes("Create Pull Requests")
    );
    handleChange(
      "isPullRequestLinksOpen",
      values.includes("Pull Request Links")
    );
  };

  return (
    <div>
      {dependency.executeAll ? (
        <EAMetadataSection dependency={dependency} onChange={handleChange} />
      ) : (
        <IEMetadataSection dependency={dependency} onChange={handleChange} />
      )}
      <Accordion
        type="multiple"
        className="pb-2 mt-8"
        value={activeItems}
        onValueChange={handleValueChange}
      >
        <AccordionItem
          value="Dependent Applications"
          className="border px-6 mb-2 bg-card rounded-lg"
        >
          <AccordionTrigger className="cursor-pointer font-bold">
            Dependent Applications
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <Separator className="my-2" />
            {dependency.executeAll ? (
              <EADependentApplicationsSection dependency={dependency} />
            ) : (
              <IEDependentApplicationsSection dependency={dependency} />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="Create Branches"
          className="border px-6 mb-2 bg-card rounded-lg"
        >
          <AccordionTrigger className="cursor-pointer font-bold">
            Create Branches
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <Separator className="my-2" />
            {dependency.executeAll ? (
              <EACreateBranchesSection
                dependency={dependency}
                handleChange={handleChange}
              />
            ) : (
              <IECreateBranchesSection
                dependency={dependency}
                handleChange={handleChange}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="Update Files"
          className="border px-6 mb-2 bg-card rounded-lg"
        >
          <AccordionTrigger className="cursor-pointer font-bold">
            Update Files
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <Separator className="my-2" />
            {dependency.executeAll ? (
              <EAUpdateFilesSection
                dependency={dependency}
                handleChange={handleChange}
              />
            ) : (
              <IEUpdateFilesSection
                dependency={dependency}
                handleChange={handleChange}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <div className="border rounded-lg">
          <AccordionItem
            value="Create Pull Requests"
            className="px-6 bg-card rounded-lg"
          >
            <AccordionTrigger className="cursor-pointer font-bold">
              Create Pull Requests
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <Separator className="my-2" />
              {dependency.executeAll ? (
                <EACreatePullRequestsSection
                  dependency={dependency}
                  handleChange={handleChange}
                />
              ) : (
                <IECreatePullRequestsSection
                  dependency={dependency}
                  handleChange={handleChange}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </div>

        {dependentRepositories.length > 0 && (
          <PullRequestsSection dependency={dependency} />
        )}
      </Accordion>
    </div>
  );
};

export default PipelineAccordionSection;
