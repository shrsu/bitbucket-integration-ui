import { Toaster } from "@/components/ui/sonner";
import { useEffect, type JSX } from "react";
import { Provider } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AppSidebar } from "./components/AppSideBar";
import Loader from "./components/ui/loader";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { UserProvider, useUser } from "./context/UserContext";
import { LoaderProvider, useLoader } from "./hooks/useLoader";
import BranchesPage from "./pages/BranchesPage";
import CredentialsPage from "./pages/CredentialsPage";
import EditorPage from "./pages/EditorPage";
import PipeLinesPage from "./pages/PipeLinesPage";
import store from "./redux/store";
import { ModeToggle } from "./theme/ModeToggle";
import { ThemeProvider } from "./theme/ThemeProvider";
import { Eraser } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { useDispatch } from "react-redux";
import { resetLocalStorage } from "./redux/utils/utilityFunctions";

function AppContent(): JSX.Element | null {
  const defaultOpen: boolean =
    localStorage.getItem("sidebar_state") !== "false";
  const { showLoader, hideLoader } = useLoader();
  const { userDetailsPresent, checkingAuthToken } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleClearLocalStorage = (): void => {
    resetLocalStorage(dispatch);
  };

  useEffect(() => {
    if (checkingAuthToken) {
      showLoader("Loading...");
    } else {
      hideLoader();
    }
  }, [checkingAuthToken]);

  useEffect(() => {
    const isOnCredentialsPage: boolean = location.pathname === "/";
    if (!checkingAuthToken && !userDetailsPresent && !isOnCredentialsPage) {
      navigate("/");
    }
  }, [checkingAuthToken, userDetailsPresent, location.pathname, navigate]);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Loader />
      {!checkingAuthToken && (
        <>
          <AppSidebar />
          <main className="mx-2 mb-2 relative rounded-lg bg-background w-full min-h-full">
            <div className="bg-card sticky top-0 z-10 pt-2 border-b">
              <div className="flex bg-background rounded-t-lg w-full justify-between p-2">
                <SidebarTrigger className="h-8 w-8 border" />
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="border h-8 w-8 cursor-pointer"
                        type="button"
                        onClick={handleClearLocalStorage}
                      >
                        <Eraser size={12} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear Local Storage</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="cursor-pointer">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Routes>
                <Route path="/pipelines" element={<PipeLinesPage />} />
                <Route path="/branches" element={<BranchesPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/" element={<CredentialsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            <Toaster />
          </main>
        </>
      )}
    </SidebarProvider>
  );
}

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <Router basename="/bitbucket-integration-ui/">
        <UserProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <LoaderProvider>
              <div className="bg-card">
                <AppContent />
              </div>
            </LoaderProvider>
          </ThemeProvider>
        </UserProvider>
      </Router>
    </Provider>
  );
}

export default App;
