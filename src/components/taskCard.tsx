import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trash, Calendar, Flag, Tag } from "lucide-react";
import { Badge } from "./ui/badge";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const priorityColors = {
  "high": "red",
  "medium": "blue",
  "low": "green"
} as const;

type Priority = keyof typeof priorityColors;

interface TaskCardProps {
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority | null;
  project: string | null;
  isCompleted: boolean;
  onClick: () => void;
  taskId: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ title, description, dueDate = null, dueTime = null, priority = null, project = null, isCompleted, onClick, taskId }) => {
  
  const getBorderColor = (priority: Priority | null) => {
    if (!priority) return "border-primary/40";
    
    switch (priority) {
      case "high":
        return "border-red-400/80 dark:border-red-400/30";
      case "medium":
        return "border-blue-400/80 dark:border-blue-400/30";
      case "low":
        return "border-green-400/80 dark:border-green-400/30";
    }
  };

  const supabase = createClientComponentClient();

  const handleDeleteTask = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      window.location.reload();
    }
  }

  const handleCompleteTask = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !isCompleted })
      .eq('id', taskId);

    if (error) {
      console.error('Error completing task:', error);
    } else {
      window.location.reload();
    }
  }
  return (
    <Card className="hover:scale-105 hover:shadow-xl transition-all duration-300">
      <CardHeader className="max-h-24 overflow-hidden">
        <div className="flex flex-row justify-between">
          <Checkbox className="my-auto cursor-pointer" onClick={handleCompleteTask} checked={isCompleted}/>
          <CardTitle onClick={onClick} className="my-auto cursor-pointer font-thin text- text-balance tracking-wide px-2">{title}</CardTitle>
          <Button variant="outline" onClick={handleDeleteTask} size="icon" className="my-auto hover:text-white hover:bg-red-500 dark:hover:text-black dark:hover:bg-red-800">
            <Trash className="size-3"/>
          </Button>
        </div>
        {description &&(
          <CardDescription className="text-sm pt-1 max-h-12 overflow-hidden">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1">
        {priority && (
          <Badge variant="outline" className={`border-2 ${getBorderColor(priority)}`}>
            <Flag className="size-3"/> {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )}
        {project && (
          <Badge variant="outline" className="border-2 border-primary/40">
            <Tag className="size-3"/> {project}
          </Badge>
        )}
        {dueDate && (
          <Badge variant="outline" className="border-2 border-primary/40">
            <Calendar className="size-3"/> {dueDate}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}