import { configureStore } from "@reduxjs/toolkit";
import { saveSliceState } from "../utils/localStorageUtils";
import branchActionsDataReducer from "./slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import dependenciesReducer from "./slices/pipelineSlices/dependenciesSlice";
import dependentRepositoriesReducer from "./slices/pipelineSlices/dependentRepositoriesSlice";
import dependencyFilesReducer from "./slices/pipelineSlices/pomFilesSlice";

// Create store with typed slices
const store = configureStore({
  reducer: {
    dependencies: dependenciesReducer,
    pomFiles: dependencyFilesReducer,
    dependentRepositories: dependentRepositoriesReducer,
    branchActionsData: branchActionsDataReducer,
  },
});

// Get state type from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Track previous state for selective saving
let prevState: RootState = store.getState();

store.subscribe(() => {
  const currentState = store.getState();

  if (prevState.dependencies !== currentState.dependencies) {
    saveSliceState("dependenciesState", currentState.dependencies);
  }
  if (prevState.pomFiles !== currentState.pomFiles) {
    saveSliceState("pomFiles", currentState.pomFiles);
  }
  if (prevState.dependentRepositories !== currentState.dependentRepositories) {
    saveSliceState("dependentRepositories", currentState.dependentRepositories);
  }
  if (prevState.branchActionsData !== currentState.branchActionsData) {
    saveSliceState("branchActionsData", currentState.branchActionsData);
  }
  prevState = currentState;
});

export default store;
