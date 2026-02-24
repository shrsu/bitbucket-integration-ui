import Cookies from "js-cookie";
import { checkAuthTokenAPI } from "@/apis/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  userName: string;
}

interface AuthContextType {
  user: User;
  setLoggedIn: (userName: string) => void;
  clearUser: () => void;
  userDetailsPresent: boolean;
  checkingAuthToken: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User>({ userName: "" });
  const [checkingAuthToken, setCheckingAuthToken] = useState(true);

  const userDetailsPresent = useMemo(() => {
    return !!user.userName;
  }, [user.userName]);

  const setLoggedIn = (userName: string) => {
    setUserState({ userName });
    Cookies.set("userName", userName, { expires: 0.0208333, path: "/" });
  };

  const clearUser = () => {
    setUserState({ userName: "" });
    Cookies.remove("userName", { path: "/" });
  };

  useEffect(() => {
    const userName = Cookies.get("userName");
    if (!userName) {
      clearUser();
      setCheckingAuthToken(false);
      return;
    }

    checkAuthTokenAPI()
      .then(() => {
        setUserState({ userName });
      })
      .catch(() => {
        clearUser();
      })
      .finally(() => {
        setCheckingAuthToken(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setLoggedIn,
        clearUser,
        userDetailsPresent,
        checkingAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default AuthContext;
