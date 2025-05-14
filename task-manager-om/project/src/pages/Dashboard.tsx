import React, { useEffect } from 'react';
import TaskList from '../components/tasks/TaskList';
import { useTask } from '../contexts/TaskContext';

const Dashboard: React.FC = () => {
  const { getTasks } = useTask();

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and organize your tasks efficiently
        </p>
      </div>
      
      <TaskList />
    </div>
  );
};

export default Dashboard;