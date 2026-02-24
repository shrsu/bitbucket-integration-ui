import { useLoader } from "@/hooks/useLoader";
import {
  setFromBranch,
  setNewBranch,
} from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { type AppDispatch, type RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createBranches } from "./branchActions/createBranches";

function CreateBranchesInputDiv() {
  const dispatch = useDispatch<AppDispatch>();
  const { showLoader, hideLoader } = useLoader();

  const branchActionsData = useSelector(
    (state: RootState) => state.branchActionsData
  );

  const { fromBranch, newBranch } = branchActionsData;

  const isButtonDisabled = !fromBranch.trim() || !newBranch.trim();

  const handleCreateBranch = async () => {
    try {
      await createBranches(dispatch, showLoader, branchActionsData);
    } catch (error) {
      console.error("Error creating branches:", error);
    } finally {
      hideLoader();
    }
  };


  return (
    <div className="mt-8">
      <div className="flex gap-4 mb-4">
        <div>
          <Label htmlFor="from-branch" className="mb-2 font-bold">
            From Branch
          </Label>
          <Input
            id="from-branch"
            value={fromBranch}
            onChange={(e) => dispatch(setFromBranch(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="new-branch" className="mb-2 font-bold">
            New Branch
          </Label>
          <Input
            id="new-branch"
            value={newBranch}
            onChange={(e) => dispatch(setNewBranch(e.target.value))}
          />
        </div>
      </div>

      <Button onClick={handleCreateBranch} disabled={isButtonDisabled}>
        Create Branches
      </Button>
    </div>
  );
}

export default CreateBranchesInputDiv;
