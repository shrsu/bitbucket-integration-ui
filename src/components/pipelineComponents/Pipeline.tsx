import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { RxCross2 } from "react-icons/rx";
import { TbRefresh } from "react-icons/tb";

import { useLoader } from "@/hooks/useLoader";

import type { AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type DependentRepository } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import type { RootState } from "@/redux/store";

import { updateAddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { removeDependencyWithAssociations } from "@/redux/utils/utilityFunctions";

import { getVersionsAndDependantApps } from "./pipelineActions/getVersionsAndDependentApps";
import { handleCommit } from "./pipelineActions/handleCommit";
import { handleCreateBranches } from "./pipelineActions/handleCreateBranches";
import { handleCreatePullRequests } from "./pipelineActions/handleCreatePullRequests";
import { handleUpdateFiles } from "./pipelineActions/handleUpdateFiles";

import PipelineAccordionSection from "./PipelineAccordionSection";

interface PipelineProps {
  id: string;
}

const Pipeline: React.FC<PipelineProps> = ({ id }) => {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const dependency = useSelector((state: RootState) =>
    state.dependencies.addedDependencies.find((dep) => dep.id === id)
  );

  const dependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) =>
      state.dependentRepositories.filter((repo) => repo.dependencyId === id)
  );

  const handleChange = (field: keyof AddedDependency, value: any): void => {
    dispatch(updateAddedDependency({ id, updates: { [field]: value } }));
  };

  const handleRemove = (): void => {
    removeDependencyWithAssociations(id, dispatch);
  };

  const handleRefresh = async (): Promise<void> => {
    if (!dependency) return;

    try {
      showLoader("Reloading selected Dependency pipeline...");
      removeDependencyWithAssociations(id, dispatch);
      await getVersionsAndDependantApps(dependency, dispatch, showLoader);
    } catch (error) {
      console.error("Error refreshing dependency pipeline:", error);
    } finally {
      hideLoader();
    }
  };

  const handleModeChange = (checked: boolean) => {
    handleChange("executeAll", checked);
  };

  const onExecuteAll = async () => {
    if (!dependency) return;

    try {
      showLoader("Executing all steps...");

      await handleCreateBranches(
        id,
        dispatch,
        showLoader,
        dependency,
        dependentRepositories
      );

      const updatedPomFiles = await handleUpdateFiles(
        dependency.id,
        dispatch,
        showLoader,
        dependency,
        dependentRepositories
      );

      await handleCommit(dispatch, showLoader, dependency, updatedPomFiles);

      await handleCreatePullRequests(
        dependency,
        dependentRepositories,
        showLoader,
        dispatch
      );
    } catch (error) {
      console.error("Error executing all steps:", error);
    } finally {
      hideLoader();
    }
  };

  if (!dependency)
    return <div className="text-red-500">Dependency not found.</div>;

  const isToggleDisabled = dependency.individualModeExecuted;
  const tooltipMessage = (
    <>
      Mode locked after executing in Individual Mode.
      <br />
      Refresh to toggle again.
    </>
  );

  return (
    <Accordion
      type="multiple"
      value={dependency.isOpen ? ["item-1"] : []}
      onValueChange={(values) =>
        handleChange("isOpen", values.includes("item-1"))
      }
      className="w-full"
    >
      <AccordionItem value="item-1" className="p-0">
        <div className="flex justify-between items-center py-3 px-6">
          <AccordionTrigger className="cursor-pointer font-bold">
            <span>{dependency.name}</span>
          </AccordionTrigger>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-xs h-7 w-7"
            >
              <TbRefresh />
            </Button>

            <Button
              onClick={handleRemove}
              variant="destructive"
              size="sm"
              className="text-xs h-7 w-7"
            >
              <RxCross2 size={12} />
            </Button>
          </div>
        </div>

        <AccordionContent className="flex flex-col gap-4 text-balance">
          <Separator className="mt-2" />
          <Accordion type="multiple" className="w-full py-4 px-8">
            <div className="flex flex-col w-full mb-6 items-end">
              <TooltipProvider>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Switch
                          id="execute-all"
                          checked={dependency.executeAll}
                          disabled={isToggleDisabled}
                          onCheckedChange={handleModeChange}
                        />
                      </div>
                    </TooltipTrigger>
                    {isToggleDisabled && (
                      <TooltipContent side="left">
                        {tooltipMessage}
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <Button
                    disabled={!dependency.executeAll}
                    onClick={onExecuteAll}
                    className="border border-transparent"
                    variant={dependency.executeAll ? "default" : "outline"}
                  >
                    Execute All
                  </Button>
                </div>
              </TooltipProvider>
            </div>

            <PipelineAccordionSection
              dependency={dependency}
              handleChange={handleChange}
            />
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Pipeline;
