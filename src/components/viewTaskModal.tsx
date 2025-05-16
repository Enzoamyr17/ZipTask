import React, { useState, useEffect } from 'react';
import { CalendarIcon, X, Clock, Flag, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { format, parse } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  task: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  project_id: string | null;
  projects?: {
    name: string;
  };
}

export const ViewTaskModal = ({ taskId, toggleViewTaskModal }: { taskId: string, toggleViewTaskModal: () => void }) => {
  const [taskDate, setDate] = useState<Date>();
  const [taskTime, setTime] = useState<string>();
  const [timeInputValue, setTimeInputValue] = useState<string>();
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskName, setTaskName] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('');
  const [taskProject, setTaskProject] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const supabase = createClientComponentClient();
  const { user } = useUser();

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects:project_id (
            name
          )
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        return;
      }

      if (task) {
        setTaskName(task.task);
        setTaskDescription(task.description || '');
        setTaskPriority(task.priority || '');
        setTaskProject(task.project_id || '');
        if (task.due_date) {
          setDate(parse(task.due_date, 'yyyy-MM-dd', new Date()));
        }
        if (task.due_time) {
          setTime(task.due_time);
          // Convert time to 24-hour format for input
          const [time, period] = task.due_time.split(' ');
          const [hours, minutes] = time.split(':');
          const hour = period === 'PM' ? (parseInt(hours) % 12) + 12 : parseInt(hours) % 12;
          setTimeInputValue(`${hour.toString().padStart(2, '0')}:${minutes}`);
        }
      }
    };

    if (taskId) {
      const fetchProjects = async () => {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id);

        if (error) {
          console.error('Error fetching projects:', error);
        } else {
          setProjects(projects || []);
        }
      };
      fetchProjects();
    }

    fetchTask();
  }, [taskId, supabase]);

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInputValue(e.target.value);
  };

  const timeInput = () => {
    if (!timeInputValue) return;
    const [hour, minute] = timeInputValue.split(':');
    const hourInt = parseInt(hour, 10);
    const ampm = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12;
    const formattedTime = `${hour12}:${minute} ${ampm}`;
    setTime(formattedTime);
  };

  const handleUpdateTask = async () => {
    const { error } = await supabase
      .from('tasks')
      .update({
        task: taskName,
        description: taskDescription,
        due_date: taskDate ? format(taskDate, 'yyyy-MM-dd') : null,
        due_time: taskTime,
        priority: taskPriority || null,
        project_id: taskProject || null,
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      toggleViewTaskModal();
      window.location.reload();
    }
  };

  return (
    <div id="view-task-modal" className="hidden absolute flex top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm z-50">
      <div className="flex flex-col max-w-[95%] md:max-w-[45vw] m-auto items-center justify-center bg-primary-foreground/90 rounded-xl py-8 gap-6">
        <div className="flex flex-row justify-between w-full px-6">
          <h1 className="text-primary my-auto text-xl font-semibold">Edit Task</h1>
          <Button variant="ghost" onClick={toggleViewTaskModal} size="icon" className="my-auto text-primary hover:text-red-600 hover:scale-110 hover:shadow-xl"><X className="size-5"/></Button>
        </div>
        <div className="flex flex-col w-full gap-1">
          <Input 
            className="w-full border-t-0 border-b-1 border-b-primary/40 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-x-0" 
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
          />
          <Textarea 
            className="w-full h-auto border-t-0 border-b-1 border-b-primary/40 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-x-0" 
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Task Description"
          />
        </div>
        <div className="flex flex-wrap w-full px-6 gap-4">
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
          {/* Time Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="my-auto w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
                <Clock />{taskTime ? taskTime : <span>Due Time</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2 w-44">
              <Input type="time" onChange={handleTimeInput} value={timeInputValue}/>
              <Button variant="outline" onClick={timeInput} size="icon" className="m-auto w-5/6 px-2 text-primary hover:scale-110 hover:shadow-xl">Set Time</Button>
              <Button variant="outline" size="icon" onClick={() => setTime('')} className={`m-auto w-5/6 px-2 text-primary hover:bg-destructive/50 hover:scale-110 hover:shadow-xl ${taskTime ? '' : 'hidden'}`}>Reset Time</Button>
            </PopoverContent>
          </Popover>
          {/* Priority Select */}
          <Select value={taskPriority} onValueChange={setTaskPriority}>
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
          <Select value={taskProject} onValueChange={setTaskProject}>
            <SelectTrigger className="w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
              <Tag className="size-3"/>
              <SelectValue placeholder="Project"/>
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleUpdateTask} className="w-1/3">Update Task</Button>
      </div>
    </div>
  );
};

export default ViewTaskModal;