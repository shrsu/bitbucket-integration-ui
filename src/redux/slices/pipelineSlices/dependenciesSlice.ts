import { loadSliceState } from "@/utils/localStorageUtils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type DependencyStatus = "checked" | "can-be-added" | "none";

export interface SupportedDependency {
  name: string;
  status: DependencyStatus;
}

export interface AddedDependency {
  id: string;
  name: string;
  selectedVersion: string;
  versions: { name: string }[];
  fromBranch: string;
  newBranch: string;
  prFromBranch: string;
  toBranch: string;
  updateFileBranch: string;
  executeAll: boolean;
  isOpen: boolean;
  isDependentApplicationsOpen: boolean;
  isCreateBranchesOpen: boolean;
  isUpdateFilesOpen: boolean;
  isCreatePullRequestsOpen: boolean;
  isPullRequestLinksOpen: boolean;
  commitMessage: string;
  pullRequestTitle: string;
  pullRequestDescription: string;
  individualModeExecuted: boolean;
}

export interface DependenciesState {
  supportedDependencies: SupportedDependency[];
  addedDependencies: AddedDependency[];
}

const defaultState: DependenciesState = {
  supportedDependencies: [],
  addedDependencies: [],
};

const initialState: DependenciesState =
  loadSliceState("dependenciesState") || defaultState;

const dependenciesSlice = createSlice({
  name: "dependencies",
  initialState,
  reducers: {
    setSupportedDependencies(state, action: PayloadAction<string[]>) {
      const existingNames = state.addedDependencies.map((d) => d.name);
      state.supportedDependencies = action.payload.map((name) => ({
        name,
        status: existingNames.includes(name) ? "none" : "can-be-added",
      }));
    },

    toggleDependencyStatus(state, action: PayloadAction<string>) {
      const name = action.payload;
      const dep = state.supportedDependencies.find((d) => d.name === name);
      if (dep) {
        dep.status = dep.status === "checked" ? "can-be-added" : "checked";
      }
    },

    updateDependencyStatus(
      state,
      action: PayloadAction<{ name: string; status: DependencyStatus }>
    ) {
      const { name, status } = action.payload;
      const dep = state.supportedDependencies.find((d) => d.name === name);
      if (dep) {
        dep.status = status;
      }
    },

    updateDependencyStatusById(
      state,
      action: PayloadAction<{ id: string; status: DependencyStatus }>
    ) {
      const { id, status } = action.payload;
      const addedDep = state.addedDependencies.find((d) => d.id === id);
      if (addedDep) {
        const dep = state.supportedDependencies.find(
          (d) => d.name === addedDep.name
        );
        if (dep) {
          dep.status = status;
        }
      }
    },

    addSelectedDependency(state, action: PayloadAction<AddedDependency>) {
      state.addedDependencies.push(action.payload);
    },

    updateAddedDependency(
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<AddedDependency>;
      }>
    ) {
      const { id, updates } = action.payload;
      const index = state.addedDependencies.findIndex((dep) => dep.id === id);
      if (index !== -1) {
        state.addedDependencies[index] = {
          ...state.addedDependencies[index],
          ...updates,
        };
      }
    },

    removeSelectedDependency(state, action: PayloadAction<string>) {
      const idToRemove = action.payload;
      state.addedDependencies = state.addedDependencies.filter(
        (dep) => dep.id !== idToRemove
      );
    },

    resetDependenciesState(state) {
      Object.assign(state, defaultState);
    },
  },
});

export const {
  setSupportedDependencies,
  addSelectedDependency,
  updateAddedDependency,
  removeSelectedDependency,
  toggleDependencyStatus,
  updateDependencyStatus,
  updateDependencyStatusById,
  resetDependenciesState,
} = dependenciesSlice.actions;

export default dependenciesSlice.reducer;
