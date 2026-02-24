import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateBranchesInputDiv from "./CreateBranchesInputDiv";
import CreatePullRequestsInputDiv from "./CreatePullRequestsInputDiv";

function BranchActions() {
  return (
    <Card>
      <CardContent className="w-full">
        <Tabs defaultValue="branches">
          <TabsList className="grid grid-cols-2 ml-auto">
            <TabsTrigger value="branches">Create Branches</TabsTrigger>
            <TabsTrigger value="pullRequests">Create Pull Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="branches">
            <CreateBranchesInputDiv />
          </TabsContent>
          <TabsContent value="pullRequests">
            <CreatePullRequestsInputDiv />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default BranchActions;
