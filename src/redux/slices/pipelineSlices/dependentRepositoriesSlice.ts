import { loadSliceState } from "@/utils/localStorageUtils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Branches {
  displayId: string;
}

export interface DependentApplication {
  id: string;
  projectName: string;
  repoName: string;
  moduleName: string;
  updateDpendencyVersion: boolean;
  updateDpendencyVersionstatus?: string;
  updateDpendencyVersionmessage?: string;
  pomFileId: string;
}

export interface Build {
  cancelled: number;
  successful: number;
  inProgress: number;
  failed: number;
  unknown: number;
}

export interface DependentRepository {
  id: string;
  projectName: string;
  repoName: string;
  dependencyName: string;
  dependencyId: string;
  error?: string;
  branches: Branches[];
  createBranchesStatus: string;
  createBranchesMessage: string;
  createPullRequestsStatus: string;
  createPullRequestsMessage: string;
  createBranches: boolean;
  createPullRequests: boolean;
  prLink: string;
  prId?: string;
  dependentApplications: DependentApplication[];
  build: Build;
}

export interface UpdateDependentRepositoryPayload {
  id: string;
  updates: Partial<DependentRepository>;
}

export interface UpdateByAttributesPayload {
  dependencyId: string;
  projectName: string;
  repoName: string;
  updates: Partial<DependentRepository>;
}

const initialState: DependentRepository[] =
  loadSliceState("dependentRepositories") || [];

const defaultState: DependentRepository[] = [];

const dependentReposSlice = createSlice({
  name: "dependentRepositories",
  initialState,
  reducers: {
    addDependentRepository(state, action: PayloadAction<DependentRepository>) {
      state.push(action.payload);
    },

    updateDependentRepository(
      state,
      action: PayloadAction<UpdateDependentRepositoryPayload>
    ) {
      const { id, updates } = action.payload;
      const index = state.findIndex((repo) => repo.id === id);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...updates,
        };
      }
    },

    removeDependentRepositoriesByDependencyId(
      state,
      action: PayloadAction<string>
    ) {
      const dependencyIdToRemove = action.payload;
      return state.filter((repo) => repo.dependencyId !== dependencyIdToRemove);
    },

    updateDependentRepositoryUsingAttributes(
      state,
      action: PayloadAction<UpdateByAttributesPayload>
    ) {
      const { dependencyId, repoName, projectName, updates } = action.payload;
      const targetRepo = state.find(
        (repo) =>
          repo.dependencyId === dependencyId &&
          repo.repoName === repoName &&
          repo.projectName === projectName
      );

      if (targetRepo) {
        Object.assign(targetRepo, updates);
      }
    },

    addDependentApplication(
      state,
      action: PayloadAction<{
        repoId: string;
        application: DependentApplication;
      }>
    ) {
      const { repoId, application } = action.payload;
      const repo = state.find((repo) => repo.id === repoId);
      if (repo) {
        repo.dependentApplications.push(application);
      }
    },

    updateDependentApplication(
      state,
      action: PayloadAction<{
        repoId: string;
        appId: string;
        updates: Partial<DependentApplication>;
      }>
    ) {
      const { repoId, appId, updates } = action.payload;
      const repo = state.find((repo) => repo.id === repoId);
      if (repo) {
        const appIndex = repo.dependentApplications.findIndex(
          (app) => app.id === appId
        );
        if (appIndex !== -1) {
          repo.dependentApplications[appIndex] = {
            ...repo.dependentApplications[appIndex],
            ...updates,
          };
        }
      }
    },
    resetDependentRepositories() {
      return defaultState;
    },
  },
});

export const {
  addDependentRepository,
  updateDependentRepository,
  removeDependentRepositoriesByDependencyId,
  updateDependentRepositoryUsingAttributes,
  addDependentApplication,
  updateDependentApplication,
  resetDependentRepositories,
} = dependentReposSlice.actions;

export default dependentReposSlice.reducer;
