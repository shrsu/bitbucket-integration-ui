import { FileSliders } from "lucide-react";
import { IoMdGitBranch } from "react-icons/io";
import { LuSettings2 } from "react-icons/lu";
import { MdOutlinePassword } from "react-icons/md";

import Cookies from "js-cookie";
import { useEffect, type JSX } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useUser } from "@/context/UserContext";
import { Button } from "./ui/button";

interface SidebarItem {
  title: string;
  to: string;
  icon: React.ElementType;
  css?: string;
}

const items: SidebarItem[] = [
  {
    title: "Pipelines",
    to: "/pipelines",
    icon: LuSettings2,
  },
  {
    title: "Branch Actions",
    to: "/branches",
    icon: IoMdGitBranch,
  },
];

export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { open } = useSidebar();
  const { userDetailsPresent } = useUser();

  useEffect(() => {
    Cookies.set("sidebar_state", open.toString(), { path: "/" });
  }, [open]);

  const isActive = (path: string): boolean => {
    return location.pathname.endsWith(path);
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-none pl-3">
      <SidebarHeader>
        <Button variant={"outline"} className="font-bold text-left text-sidebar-foreground/70 mt-2">
          Bitbucket-integration
        </Button>
      </SidebarHeader>
      <SidebarContent className="mt-20">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={item.css ?? ""}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={
                      userDetailsPresent
                        ? item.title
                        : "Enter credentials to access"
                    }
                  >
                    {userDetailsPresent ? (
                      <NavLink to={item.to}>
                        <item.icon />
                        <span className="ml-4">{item.title}</span>
                      </NavLink>
                    ) : (
                      <div className="flex items-center opacity-50 pointer-events-none cursor-not-allowed">
                        <item.icon />
                        <span className="ml-4">{item.title}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("editor")}
                  tooltip={
                    userDetailsPresent
                      ? "Code Editor"
                      : "Enter credentials to access"
                  }
                >
                  {userDetailsPresent ? (
                    <NavLink to="/editor">
                      <FileSliders />
                      <span className="ml-4">Code Editor</span>
                    </NavLink>
                  ) : (
                    <div className="flex items-center opacity-50 pointer-events-none cursor-not-allowed">
                      <FileSliders />
                      <span className="ml-4">Code Editor</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/")}
              tooltip="Credentials"
            >
              <NavLink to="/">
                <MdOutlinePassword />
                <span className="ml-4 text-xs">Credentials</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
