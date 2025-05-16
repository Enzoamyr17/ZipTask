"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns"
import * as React from "react";
import { TaskCard } from "@/components/taskCard";
import { AddTaskModal } from "@/components/addTaskModal";
import { ViewTaskModal } from "@/components/viewTasModal";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@/contexts/UserContext";
import { useParams, useRouter } from "next/navigation";

export default function DashboardLayout() {

  const { slug } = useParams();

  // Supabase
  const supabase = createClientComponentClient(); //Create Client First
  const { user, loading: userLoading } = useUser(); // User Context

  // Task Modals
  const [addTaskModal, setAddTaskModal] = useState<boolean>(false);
  const [viewTaskModal, setViewTaskModal] = useState<boolean>(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  

  const currentDate = () => {
    const date = new Date();
    return format(date, 'yyyy-MM-dd');
  }


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
          .eq('completed', false)
          .eq('project_id', slug)
          .order('priority', { ascending: true });

        if (error) {
          console.error('Error fetching tasks:', error);
          setError(error.message);
          return;
        }

        setTasks(tasks || []);
      } catch (err) {
        console.error('Unexpected error:', err);
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
        console.error('Error fetching projects:', error);
      } else {
        setProjects(projects);
      }
    };

    if (!userLoading) {
      fetchTasks();
      fetchProjects();
    }
  }, [user, userLoading, supabase]); // Re-rund when one of these 3 changes

  // Add Task Modal
  const toggleAddTaskModal = () => {
    setAddTaskModal(!addTaskModal);
    let modal = document.getElementById('add-task-modal')
    if (modal) {
      modal.classList.toggle('hidden')
    }
  }

  // View Task Modal
  const toggleViewTaskModal = () => {
    setViewTaskModal(!viewTaskModal);
    let modal = document.getElementById('view-task-modal')
    if (modal) {
      modal.classList.toggle('hidden')
    }
  }


  return (
    <div className="h-screen w-full">
      {/* Sidebar is in the layout.tsx file and components/app-sidebar.tsx */}

      {/* Add Task Modal */}
      <AddTaskModal 
        projects={projects} 
        projectId={slug}
      />

      {/* View Task Modal */}
      <ViewTaskModal />

      {/* Loading and Error States */}
      {loading && <div className="p-4">Loading tasks...</div>}
      {error && <div className="p-4 text-red-500">{error}</div>}
      {!loading && !error && tasks.length === 0 && (
        <div className="p-4 text-muted-foreground">No tasks found</div>
      )}

      {/* Cards Sections */}
      <div className="container-dark flex w-full h-[90.8vh] bg-primary/30 overflow-x-auto p-4 gap-4">
        {/* Overdue Section */}
        <div className="w-1/3 min-w-94 flex flex-col h-full rounded-xl p-8 bg-primary/10 border border-primary/10 shadow-xl dark:bg-primary-foreground/90 dark:shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] dark:border-primary-foreground/90 overflow-y-auto gap-4">
            <h1 className="text-red-600 dark:text-red-500/80 text-2xl pl-2 font-bold dark:font-semibold">Overdue</h1>

            {tasks.map((task) => (
              task.due_date < currentDate() && (
                <TaskCard 
                  key={task.id}
                  taskId={task.id}
                  title={task.task} 
                  description={task.description} 
                  priority={task.priority} 
                  isCompleted={task.completed}
                  onClick={toggleViewTaskModal}
                  dueDate={task.due_date}
                  dueTime={task.due_time}
                  project={task.projects?.name || null}
                />
              ) 
            ))}
          </div>

        {/* Today Section */}
        <div className="w-1/3 min-w-94 flex flex-col h-full rounded-xl p-8 bg-primary/10 border border-primary/10 shadow-xl dark:bg-primary-foreground/90 dark:shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] dark:border-primary-foreground/90 overflow-y-auto gap-4">
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl pl-2 font-bold dark:font-semibold">Today</h1>
            <Button variant="outline" onClick={toggleAddTaskModal} size="icon" className="my-auto hover:text-green-800 dark:hover:text-black dark:hover:bg-secondary">
              <Plus className="size-3"/>
            </Button>
          </div>


          {tasks.map((task) => (
              task.due_date === currentDate() && (
                <TaskCard 
                  key={task.id}
                  taskId={task.id}
                  title={task.task} 
                  description={task.description} 
                  priority={task.priority} 
                  isCompleted={task.completed}
                  onClick={toggleViewTaskModal}
                  dueDate={task.due_date}
                  dueTime={task.due_time}
                  project={task.projects?.name || null}
                />
              ) 
            ))}

        </div>

        {/* Upcoming Section */}
        <div className="w-1/3 min-w-94 flex flex-col h-full rounded-xl p-8 bg-primary/10 border border-primary/10 shadow-xl dark:bg-primary-foreground/90 dark:shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] dark:border-primary-foreground/90 overflow-y-auto gap-4">
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl pl-2 font-bold dark:font-semibold">Upcoming</h1>
          </div>


          {tasks.map((task) => (
              task.due_date > currentDate() && (
                <TaskCard 
                  key={task.id}
                  taskId={task.id}
                  title={task.task} 
                  description={task.description} 
                  priority={task.priority} 
                  isCompleted={task.completed}
                  onClick={toggleViewTaskModal}
                  dueDate={task.due_date}
                  dueTime={task.due_time}
                  project={task.projects?.name || null}
                />
              ) 
            ))}

        </div>

      </div>

    </div>
  );
}
