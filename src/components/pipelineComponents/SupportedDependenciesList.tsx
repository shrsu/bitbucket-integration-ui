import { getSupportedDependenciesAPI } from "@/apis/api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { useLoader } from "@/hooks/useLoader";
import {
  setSupportedDependencies,
  toggleDependencyStatus,
  type SupportedDependency,
} from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { getVersionsAndDependantApps } from "./pipelineActions/getVersionsAndDependentApps";

const SupportedDependenciesList: React.FC = () => {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const supportedDependencies: SupportedDependency[] = useSelector(
    (state: RootState) => state.dependencies.supportedDependencies
  );

  useEffect(() => {
    getSupportedDependenciesAPI()
      .then((response) => {
        dispatch(setSupportedDependencies(response.data));
      })
      .catch((error) => {
        console.error("Failed to fetch supported dependencies:", error);
      });
  }, []);

  const handleAddClick = async () => {
    const depsToAdd = supportedDependencies.filter(
      (d) => d.status === "checked"
    );

    try {
      for (const dep of depsToAdd) {
        await getVersionsAndDependantApps(dep, dispatch, showLoader);
      }
    } catch (error) {
      console.error("Error adding dependencies:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <Button variant="default">Add Dependencies</Button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="w-fit ml-16 mt-2 p-4 space-y-4"
      >
        <h4 className="text-base font-bold">Supported Dependencies</h4>
        <div className="flex mt-8 flex-col gap-3 w-fit">
          {supportedDependencies.filter((dep) => dep.status !== "none").length >
          0 ? (
            supportedDependencies
              .filter((dep) => dep.status !== "none")
              .map((dep) => (
                <div className="flex w-fit items-start gap-3" key={dep.name}>
                  <Checkbox
                    id={dep.name}
                    checked={dep.status === "checked"}
                    onCheckedChange={() =>
                      dispatch(toggleDependencyStatus(dep.name))
                    }
                  />
                  <Label htmlFor={dep.name}>{dep.name}</Label>
                </div>
              ))
          ) : (
            <div className="text-sm text-gray-500 italic px-1">
              No dependencies to add
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            variant="secondary"
            className="text-xs"
            size="sm"
            onClick={handleAddClick}
          >
            Add
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default SupportedDependenciesList;
