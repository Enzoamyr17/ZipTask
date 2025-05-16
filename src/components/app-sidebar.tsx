import { Calendar, Home, Inbox, Plus, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ToggleDarkmode from "@/components/toggleDarkmode";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]


export function AppSidebar() {
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  
  const fetchProjects = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  useEffect(() => {
    if (!userLoading) {
      fetchProjects();
    }
  }, [user, userLoading, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Sidebar className="">
      <SidebarContent>

        <SidebarGroup>
          <div className="flex justify-between py-3">
            <SidebarGroupLabel className="w-5/6 p-1">
              <Button variant="link" className="pl-0">
                Navigation
              </Button>
              
            </SidebarGroupLabel>
            <SidebarTrigger className="w-1/6 m-auto"/>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="p-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex justify-between py-3 px-3">
            <SidebarGroupLabel className="m-auto w-5/6 p-1">
              <Button variant="link" className="pl-0">
                Projects
              </Button>
              
            </SidebarGroupLabel>
            <Button variant="ghost" className="flex m-auto w-6 h-6">
              <Plus />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="px-4">
              {projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={`/dashboard/${item.id}`}>
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="absolute bottom-4">
            <SidebarGroupContent>
                <SidebarMenu className="px-4 gap-2">
                    <ToggleDarkmode />
                    <Button 
                      variant="logout" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}
