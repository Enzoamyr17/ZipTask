"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useUser } from "@/contexts/UserContext";
import "./styles.css"
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TIMEOUT } from "dns";
import { useSidebar } from "@/components/ui/sidebar";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const { user, loading:userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksToday, setTasksToday] = useState<number>(0);
  const [overdueTasks, setOverdueTasks] = useState<number>(0);
  const [projects, setProjects] = useState<any[]>([]);

  const pathname = usePathname();

  const currentDate = () => {
    const date = new Date();
    return format(date, 'yyyy-MM-dd');
  }


  const fetchTasksToday = () => {
    const count = tasks.filter((task) => task.due_date === currentDate()).length;
    setTasksToday(count);
  }

  const fetchOverdueTasks = () => {
    const count = tasks.filter((task) => task.due_date < currentDate()).length;
    setOverdueTasks(count);
  }

  
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select(`
            *,
            projects:project_id (
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('completed', false);

        if (error) {
          setError(error.message);
          return;
        }

        setTasks(tasks || []);
      } catch (err) {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
        return;
      }

      setProjects(projects || []);
      console.log(projects);
    };
    if (!userLoading) {
      fetchTasks();
      fetchProjects();
    }
  }, [user, userLoading, supabase]); // Re-rund when one of these 3 changes

  useEffect(() => {
    fetchTasksToday();
    fetchOverdueTasks();
  }, [tasks]);

  const [isOpen, setIsOpen] = useState(true);

  let headerTitle = "";



  if (pathname.startsWith("/dashboard/")) {
    const projectId = pathname.split("/").pop();    
    const project = projects.find(p => p.id === projectId);
    headerTitle = project?.name || "Dashboard";
  }else{
    headerTitle = pathname?.split("/").pop() || "Dashboard";
    headerTitle = headerTitle?.charAt(0).toUpperCase() + headerTitle?.slice(1);
  }


  return (
    <div className="flex">
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <SidebarTrigger onClick={() => setIsOpen(!isOpen)} className="absolute left-3 top-5"/>
                <header className="flex flex-nowrap h-18 bg-primary/10 px-12 py-3">
                  <h1 className="text-lg font-semibold text-left m-auto ml-0">{headerTitle}</h1>
                  <div className="flex flex-col gap-1">
                    <h1 className="text-sm text-center m-auto mr-0">Tasks Today: {tasksToday}</h1>
                    <h1 className="text-sm text-center m-auto mr-0">Overdue: {overdueTasks}</h1>

                  </div>
                </header>
                {children}
            </main>
        </SidebarProvider>
    </div>
  )
}
