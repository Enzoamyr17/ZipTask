import React, { useEffect, useState } from 'react';
import { CalendarIcon, X, Clock, Flag, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AddTaskModalProps {
  projects: any[];
  projectId: any | null;
}

const TIMEZONE = 'Asia/Manila';

export const AddTaskModal = ({ projects, projectId }: AddTaskModalProps) => {
  const [taskDate, setDate] = useState<Date>();
  const [addTaskModal, setAddTaskModal] = useState<boolean>(false);
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskName, setTaskName] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('');
  const [taskProject, setTaskProject] = useState<string>('');
  const { user } = useUser();

  
  const currentDate = () => {
    const date = new Date();
    const manilaDate = toZonedTime(date, TIMEZONE);
    return format(manilaDate, 'yyyy-MM-dd');
  }
  

  const supabase = createClientComponentClient();

  const handleAddTask = async () => {
    if (!user?.id) {
      console.error("No user ID available");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          task: taskName,
          description: taskDescription,
          due_date: taskDate 
            ? format(toZonedTime(taskDate, TIMEZONE), 'yyyy-MM-dd')
            : null,
          date_created: currentDate(),
          priority: taskPriority || null,
          project_id: taskProject || null,
          completed: false
        })
        .select();

      if (error) {
        console.log("Error adding task:", error);
        return;
      } else {
        toggleAddTaskModal();
        setTaskName('');
        setTaskDescription('');
        setTaskPriority('');
        setTaskProject('');
        setDate(undefined);
        window.location.reload();
      }
    } catch (error) {
      console.log("Error adding task:", error);
      console.log(projectId)
      console.log(taskProject)
      return;
    }
  }

  const toggleAddTaskModal = () => {
    setAddTaskModal(!addTaskModal);
    
    let modal = document.getElementById('add-task-modal')
    if (modal) {
      modal.classList.toggle('hidden')
    }
  };

  useEffect(() => {
    if (projectId) {
      setTaskProject(projectId);
    }
  }, [projectId]);

  return (
    <div id="add-task-modal" className={`absolute flex top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm z-50 hidden`}>
      <div className="flex flex-col m-auto items-center justify-center bg-primary-foreground/90 rounded-xl dark:bg-primary-foreground/90 py-8 gap-6">
        <div className="flex flex-row justify-between w-full px-6">
          <h1 className="text-primary my-auto text-xl font-semibold">Add Task</h1>
          <Button variant="ghost" onClick={toggleAddTaskModal} size="icon" className="my-auto text-primary hover:text-red-600 hover:scale-110 hover:shadow-xl"><X className="size-5"/></Button>
        </div>
        <div className="flex flex-col w-full gap-1">
          <Input className="w-full border-t-0 border-b-1 border-b-primary/40 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-x-0" type="text" placeholder="Task Name" onChange={(e) => setTaskName(e.target.value)} />
          <Textarea 
            className="w-full h-auto border-t-0 border-b-1 border-b-primary/40 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-x-0" 
            placeholder="Task Description"
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-row justify-between w-full px-6 gap-4">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="my-auto w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
                <CalendarIcon />{taskDate ? format(taskDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={taskDate}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* Priority Select */}
          <Select onValueChange={(value) => setTaskPriority(value)}>
            <SelectTrigger className="w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
              <Flag className="size-3"/>
              <SelectValue placeholder="Priority"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          {/* Project Select */}
          <Select onValueChange={(value) => setTaskProject(value)}>
            <SelectTrigger className="w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
              <Tag className="size-3"/>
              <SelectValue placeholder={projectId ? projects.find(p => p.id === projectId)?.name : "Project"}/>
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) =>(
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddTask} className="w-1/3">Add Task</Button>
      </div>
    </div>
  );
};

export default AddTaskModal;