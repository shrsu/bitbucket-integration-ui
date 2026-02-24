import { useState, type JSX } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { useUser } from "@/context/UserContext";
import { useLoader } from "@/hooks/useLoader";
import { useSidebar } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CiCircleCheck, CiTrash } from "react-icons/ci";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { validateCredentialsAPI, logoutAPI } from "@/apis/api";
import InstructionsPopover from "@/components/InstructionsPopover";

const formSchema = z.object({
  username: z.string().nonempty("Username is required."),
  accessToken: z.string().nonempty("Access Token is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CredentialsPage(): JSX.Element {
  const { user, setLoggedIn, clearUser, userDetailsPresent } = useUser();
  const { showLoader, hideLoader } = useLoader();
  const { setOpen } = useSidebar();

  const [showInvalidDialog, setShowInvalidDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.userName || "",
      accessToken: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const trimmedUsername = values.username.trim();
    const trimmedAccessToken = values.accessToken.trim();
    // Bitbucket API tokens use HTTP Basic with Atlassian account email + api_token
    const authHeader = `Basic ${btoa(`${trimmedUsername}:${trimmedAccessToken}`)}`;

    showLoader("Checking credentials...");

    try {
      const res = await validateCredentialsAPI(authHeader);
      if (res.data.status === "valid") {
        setLoggedIn(trimmedUsername);
        form.reset({ username: trimmedUsername, accessToken: "" });
        setShowSuccessDialog(true);
        setOpen(true);
      } else {
        setShowInvalidDialog(true);
      }
    } catch (err) {
      setShowInvalidDialog(true);
    } finally {
      hideLoader();
    }
  };

  const handleClear = async (): Promise<void> => {
    try {
      showLoader("Logging out...");
      await logoutAPI();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      clearUser();
      form.reset({ username: "" });
      hideLoader();
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Card className="w-full mt-40 max-w-md relative">
        <div className="text-xs absolute top-6 right-5">
          <InstructionsPopover />
        </div>

        <CardHeader className="mb-4">
          <CardTitle className="font-bold">Enter Credentials</CardTitle>
          <CardDescription className="text-xs">
            Provide your username and access token.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        name="bitbucket_user"
                        inputMode="text"
                        className="text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Your Atlassian account email (shown in Bitbucket personal settings)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Token</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showAccessToken ? "text" : "password"}
                          autoComplete="new-password"
                          name="bitbucket_app_pass"
                          className="pr-10 text-sm"
                          readOnly
                          onFocus={(e) => e.target.removeAttribute("readonly")}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowAccessToken((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showAccessToken ? (
                          <AiOutlineEyeInvisible size={14} />
                        ) : (
                          <AiOutlineEye size={14} />
                        )}
                      </button>
                    </div>
                    <FormDescription className="text-xs">
                      Your Bitbucket API token (used with your Atlassian email)
                    </FormDescription>
                  </FormItem>
                )}
              />

              {!userDetailsPresent ? (
                <div className="flex w-full justify-end mt-8">
                  <Button type="submit" className="text-xs">
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex w-full gap-4 justify-end mt-8">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleClear}
                        className="rounded-md"
                        type="button"
                      >
                        <CiTrash size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear Credentials</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="p-2 rounded-md bg-accent border">
                        <CiCircleCheck />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Credentials Saved</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showInvalidDialog} onOpenChange={setShowInvalidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Credentials</AlertDialogTitle>
            <AlertDialogDescription>
              The provided username or access token is incorrect. Please
              double-check and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowInvalidDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowInvalidDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>Let's get started!</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
