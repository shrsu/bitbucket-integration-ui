import { loadSliceState } from "@/utils/localStorageUtils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Branch {
  displayId: string;
}

export interface Build {
  cancelled: number;
  successful: number;
  inProgress: number;
  failed: number;
  unknown: number;
}

export interface Repository {
  name: string;
  selected: boolean;
  createBranchesStatus?: string;
  createBranchesMessage?: string;
  createPullRequestStatus?: string;
  createPullRequestMessage?: string;
  pullRequestLink?: string;
  prId?: string;
  build?: Build;
  branches: Branch[];
}

export interface Project {
  name: string;
  repositories: Repository[];
  selectedRepositories: Repository[];
}

export interface BranchActionsData {
  supportedProjects: string[];
  fromBranch: string;
  newBranch: string;
  prFromBranch: string;
  prToBranch: string;
  prTitle: string;
  prDescription: string;
  projects: Project[];
}

const defaultState: BranchActionsData = {
  supportedProjects: ["E-OP", "E-EOR"],
  fromBranch: "develop",
  newBranch: "feature/",
  prFromBranch: "feature/",
  prToBranch: "develop",
  prTitle: "",
  prDescription: "",
  projects: [],
};

const initialState: BranchActionsData =
  loadSliceState("branchActionsData") || defaultState;

const branchActionsSlice = createSlice({
  name: "branchActionsData",
  initialState,
  reducers: {
    addProject(state, action: PayloadAction<Project>) {
      state.projects = state.projects.filter(
        (project) => project.name !== action.payload.name
      );

      state.projects.push(action.payload);

      const index = state.supportedProjects.indexOf(action.payload.name);
      if (index !== -1) {
        state.supportedProjects.splice(index, 1);
      }
    },

    removeProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter(
        (project) => project.name !== action.payload
      );

      if (!state.supportedProjects.includes(action.payload)) {
        state.supportedProjects.push(action.payload);
      }
    },

    addRepositoriesToProject(
      state,
      action: PayloadAction<{
        projectName: string;
        repositories: Repository[];
      }>
    ) {
      const project = state.projects.find(
        (p) => p.name === action.payload.projectName
      );
      if (project) {
        project.repositories = [];
        project.repositories.push(...action.payload.repositories);
      }
    },

    selectRepositories(
      state,
      action: PayloadAction<{
        projectName: string;
        repositories: Repository[];
      }>
    ) {
      const { projectName, repositories } = action.payload;
      const project = state.projects.find((p) => p.name === projectName);
      if (project) {
        project.repositories = project.repositories.filter(
          (repo) => !repositories.find((r) => r.name === repo.name)
        );
        project.selectedRepositories.push(...repositories);
      }
    },

    deselectRepository(
      state,
      action: PayloadAction<{ projectName: string; repositoryName: string }>
    ) {
      const { projectName, repositoryName } = action.payload;
      const project = state.projects.find((p) => p.name === projectName);
      if (project) {
        const index = project.selectedRepositories.findIndex(
          (r) => r.name === repositoryName
        );
        if (index !== -1) {
          const [repo] = project.selectedRepositories.splice(index, 1);
          project.repositories.push(repo);
        }
      }
    },

    updateRepository(
      state,
      action: PayloadAction<{
        projectName: string;
        repositoryName: string;
        updates: Partial<Repository>;
      }>
    ) {
      const { projectName, repositoryName, updates } = action.payload;
      const project = state.projects.find((p) => p.name === projectName);
      if (project) {
        const repoIndex = project.repositories.findIndex(
          (r) => r.name === repositoryName
        );
        if (repoIndex !== -1) {
          project.repositories[repoIndex] = {
            ...project.repositories[repoIndex],
            ...updates,
          };
          return;
        }

        const selectedRepoIndex = project.selectedRepositories.findIndex(
          (r) => r.name === repositoryName
        );
        if (selectedRepoIndex !== -1) {
          project.selectedRepositories[selectedRepoIndex] = {
            ...project.selectedRepositories[selectedRepoIndex],
            ...updates,
          };
        }
      }
    },
    setFromBranch(state, action: PayloadAction<string>) {
      state.fromBranch = action.payload;
    },

    setNewBranch(state, action: PayloadAction<string>) {
      state.newBranch = action.payload;
    },

    setPrFromBranch(state, action: PayloadAction<string>) {
      state.prFromBranch = action.payload;
    },

    setPrToBranch(state, action: PayloadAction<string>) {
      state.prToBranch = action.payload;
    },

    setPrTitle(state, action: PayloadAction<string>) {
      state.prTitle = action.payload;
    },

    setPrDescription(state, action: PayloadAction<string>) {
      state.prDescription = action.payload;
    },

    toggleRepositorySelection(
      state,
      action: PayloadAction<{ projectName: string; repositoryName: string }>
    ) {
      const { projectName, repositoryName } = action.payload;
      const project = state.projects.find((p) => p.name === projectName);
      if (!project) return;

      const selectedIndex = project.selectedRepositories.findIndex(
        (r) => r.name === repositoryName
      );

      if (selectedIndex !== -1) {
        const [repo] = project.selectedRepositories.splice(selectedIndex, 1);
        project.repositories.push(repo);
      } else {
        const repoIndex = project.repositories.findIndex(
          (r) => r.name === repositoryName
        );
        if (repoIndex !== -1) {
          const [repo] = project.repositories.splice(repoIndex, 1);
          project.selectedRepositories.push(repo);
        }
      }
    },
    resetBranchActionsData(state) {
      Object.assign(state, defaultState);
    },
  },
});

export const {
  addProject,
  removeProject,
  addRepositoriesToProject,
  selectRepositories,
  deselectRepository,
  toggleRepositorySelection,
  updateRepository,
  setFromBranch,
  setNewBranch,
  setPrFromBranch,
  setPrToBranch,
  setPrTitle,
  setPrDescription,
  resetBranchActionsData,
} = branchActionsSlice.actions;

export default branchActionsSlice.reducer;
