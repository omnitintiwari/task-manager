import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  position: number;
  assignedTo?: { _id: string; username: string };
  team?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  getTasks: (teamId?: string) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (reorderedTasks: { id: string; position: number }[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Get tasks
  const getTasks = async (teamId?: string) => {
    try {
      setLoading(true);
      const url = teamId ? `/api/tasks?teamId=${teamId}` : '/api/tasks';
      const res = await axios.get(url);
      setTasks(res.data.tasks);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch tasks';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: Partial<Task>) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/tasks', taskData);
      setTasks([...tasks, res.data.task]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create task';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      setLoading(true);
      const res = await axios.patch(`/api/tasks/${id}`, taskData);
      setTasks(tasks.map(task => (task._id === id ? res.data.task : task)));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update task';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete task';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reorder tasks
  const reorderTasks = async (reorderedTasks: { id: string; position: number }[]) => {
    try {
      setLoading(true);
      await axios.post('/api/tasks/reorder', { tasks: reorderedTasks });
      
      // Update local state
      const updatedTasks = [...tasks];
      reorderedTasks.forEach(({ id, position }) => {
        const taskIndex = updatedTasks.findIndex(task => task._id === id);
        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], position };
        }
      });
      
      setTasks(updatedTasks.sort((a, b) => a.position - b.position));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to reorder tasks';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        getTasks,
        createTask,
        updateTask,
        deleteTask,
        reorderTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};