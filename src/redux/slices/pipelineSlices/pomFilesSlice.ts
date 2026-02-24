import { loadSliceState } from "@/utils/localStorageUtils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PomFile {
  id: string;
  dependencyId: string;
  dependencyName: string;
  appId: string;
  fileName: string;
  projectName: string;
  repoName: string;
  moduleName: string;
  content: string;
  commitStatus: "success" | "failure" | "pending" | string;
  commitStatusMessage: string;
  selectedForCommit: boolean;
}

export interface UpdatePomFilePayload {
  id?: string;
  appId?: string;
  updates: Partial<PomFile>;
}

export interface UpdatePomFileByAttributesPayload {
  dependencyId: string;
  projectName: string;
  repoName: string;
  moduleName: string;
  updates: Partial<PomFile>;
}

const defaultState: PomFile[] = [];

const initialState: PomFile[] = loadSliceState("pomFiles") || defaultState;

const pomFilesSlice = createSlice({
  name: "pomFiles",
  initialState,
  reducers: {
    addPomFile(state, action: PayloadAction<PomFile>) {
      const { dependencyId, repoName, moduleName } = action.payload;

      const existingIndex = state.findIndex(
        (file) =>
          file.dependencyId === dependencyId &&
          file.repoName === repoName &&
          file.moduleName === moduleName
      );

      if (existingIndex !== -1) {
        state[existingIndex] = action.payload;
      } else {
        state.push(action.payload);
      }
    },

    updatePomFile(state, action: PayloadAction<UpdatePomFilePayload>) {
      const { id, updates } = action.payload;
      const index = state.findIndex((file) => file.id === id);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...updates,
        };
      }
    },

    updatePomFileByAttributes(
      state,
      action: PayloadAction<UpdatePomFileByAttributesPayload>
    ) {
      const { dependencyId, projectName, repoName, moduleName, updates } =
        action.payload;
      const index = state.findIndex(
        (file) =>
          file.dependencyId === dependencyId &&
          file.projectName === projectName &&
          file.repoName === repoName &&
          file.moduleName === moduleName
      );
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...updates,
        };
      }
    },

    removePomFilesByDependencyId(state, action: PayloadAction<string>) {
      return state.filter((file) => file.dependencyId !== action.payload);
    },

    removePomFile(state, action: PayloadAction<string>) {
      return state.filter((file) => file.id !== action.payload);
    },
    updatePomFileUsingAppId(
      state,
      action: PayloadAction<UpdatePomFilePayload>
    ) {
      const { appId, updates } = action.payload;
      const index = state.findIndex((file) => file.appId === appId);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...updates,
        };
      }
    },

    resetPomFiles() {
      return defaultState;
    },
  },
});

export const {
  addPomFile,
  updatePomFile,
  updatePomFileByAttributes,
  removePomFilesByDependencyId,
  removePomFile,
  updatePomFileUsingAppId,
  resetPomFiles,
} = pomFilesSlice.actions;

export default pomFilesSlice.reducer;
