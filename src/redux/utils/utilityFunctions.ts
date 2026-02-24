import {
  removeSelectedDependency,
  updateDependencyStatusById,
  resetDependenciesState,
} from "@/redux/slices/pipelineSlices/dependenciesSlice";

import {
  removePomFilesByDependencyId,
  resetPomFiles,
} from "@/redux/slices/pipelineSlices/pomFilesSlice";

import {
  removeDependentRepositoriesByDependencyId,
  resetDependentRepositories,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";

import { type AppDispatch } from "@/redux/store";

import { resetBranchActionsData } from "../slices/createBranchesAndPrsSlices/branchActionsDataSlice";

export const removeDependencyWithAssociations = (
  dependencyId: string,
  dispatch: AppDispatch
): void => {
  dispatch(
    updateDependencyStatusById({ id: dependencyId, status: "can-be-added" })
  );

  dispatch(removeSelectedDependency(dependencyId));
  dispatch(removeDependentRepositoriesByDependencyId(dependencyId));
  dispatch(removePomFilesByDependencyId(dependencyId));
};

export const createIdFromParts = (...parts: (string | undefined)[]) =>
  parts
    .map((p) => (p ?? "").trim().toLowerCase().replace(/\s+/g, "-"))
    .join("__");

export const resetLocalStorage = (dispatch: AppDispatch): void => {
  dispatch(resetDependenciesState());
  dispatch(resetDependentRepositories());
  dispatch(resetPomFiles());
  dispatch(resetBranchActionsData());

  localStorage.removeItem("dependenciesState");
  localStorage.removeItem("dependentRepositories");
  localStorage.removeItem("pomFiles");
  localStorage.removeItem("branchActionsData");
};
