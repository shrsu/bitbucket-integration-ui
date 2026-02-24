import { useLoader } from "@/hooks/useLoader";
import {
  setPrDescription,
  setPrFromBranch,
  setPrTitle,
  setPrToBranch,
} from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { type RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createPullRequests } from "./branchActions/createPullRequests";

function CreatePullRequestsInputDiv() {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const branchActionsData = useSelector(
    (state: RootState) => state.branchActionsData
  );

  const { prFromBranch, prToBranch, prTitle, prDescription } =
    branchActionsData;

  const isFormIncomplete =
    !prFromBranch?.trim() ||
    !prToBranch?.trim() ||
    !prTitle?.trim() ||
    !prDescription?.trim();

  const handleCreatePRs = async () => {
    try {
      await createPullRequests(dispatch, showLoader, branchActionsData);
    } catch (error) {
      console.error("Error creating pull requests:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex gap-4 w-full">
        <div>
          <Label className="mb-2 font-bold">From Branch</Label>
          <Input
            value={prFromBranch}
            onChange={(e) => dispatch(setPrFromBranch(e.target.value))}
            placeholder="e.g., feature/..."
          />
        </div>

        <div>
          <Label className="mb-2 font-bold">To Branch</Label>
          <Input
            value={prToBranch}
            onChange={(e) => dispatch(setPrToBranch(e.target.value))}
            placeholder="e.g., develop"
          />
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 font-bold">Title</Label>
          <Input
            value={prTitle}
            onChange={(e) => dispatch(setPrTitle(e.target.value))}
            placeholder="Enter title"
          />
        </div>
        <div>
          <Label className="mb-2 font-bold">Description</Label>
          <Input
            value={prDescription}
            onChange={(e) => dispatch(setPrDescription(e.target.value))}
            placeholder="Enter description"
          />
        </div>
      </div>

      <Button onClick={handleCreatePRs} disabled={isFormIncomplete}>
        Create Pull Requests
      </Button>
    </div>
  );
}

export default CreatePullRequestsInputDiv;
