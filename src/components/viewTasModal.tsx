import React, { useState } from 'react';
import { CalendarIcon, X, Clock, Flag, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

export const ViewTaskModal = () => {
  const [taskDate, setDate] = useState<Date>();
  const [taskTime, setTime] = useState<string>();
  const [timeInputValue, setTimeInputValue] = useState<string>();
  const [viewTaskModal, setViewTaskModal] = useState<boolean>(false);
  const [taskDescription, setTaskDescription] = useState<string>('');

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInputValue(e.target.value);
  };

  const timeInput = () => {
    if (!timeInputValue) return;
    const [hour, minute] = timeInputValue.split(':');
    const hourInt = parseInt(hour, 10);
    const ampm = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedTime = `${hour12}:${minute} ${ampm}`;
    setTime(formattedTime);
  };


  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskDescription(e.target.value);
  };

  const toggleViewTaskModal = () => {
    setViewTaskModal(!viewTaskModal);
    let modal = document.getElementById('view-task-modal')
    if (modal) {
      modal.classList.toggle('hidden')
    }
  }

  return (
          <div id="view-task-modal" className="hidden absolute flex top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm z-50">
          <div className="flex flex-col max-w-[45vw] m-auto items-center justify-center bg-primary-foreground/90 rounded-xl py-8 gap-6">
            <div className="flex flex-row justify-between w-full px-6">
              <h1 className="text-primary my-auto text-xl font-semibold">Task Name</h1>
              <Button variant="ghost" onClick={toggleViewTaskModal} size="icon" className="my-auto text-primary hover:text-red-600 hover:scale-110 hover:shadow-xl"><X className="size-5"/></Button>
            </div>
            <div className="flex flex-col w-full gap-1">
              <Textarea 
                className="w-full h-auto border-t-0 border-b-1 border-b-primary/40 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-x-0" 
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                onClick={handleDescriptionChange}
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
              <Select>
                <SelectTrigger className="w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
                  <Flag className="size-3"/>
                  <SelectValue placeholder="Priority"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
              {/* Project Select */}
              <Select>
                <SelectTrigger className="w-auto px-2 text-primary hover:scale-110 hover:shadow-xl">
                  <Tag className="size-3"/>
                  <SelectValue placeholder="Project"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Project 1</SelectItem>
                  <SelectItem value="2">Project 2</SelectItem>
                  <SelectItem value="3">Project 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={toggleViewTaskModal} className="w-1/3">Add Task</Button>
          </div>
        </div>
  );
};

export default ViewTaskModal;