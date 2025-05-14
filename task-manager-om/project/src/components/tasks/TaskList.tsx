import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import TaskItem from './TaskItem';
import { useTask } from '../../contexts/TaskContext';
import CreateTaskForm from './CreateTaskForm';
import { Plus } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  position: number;
}

interface TaskListProps {
  teamId?: string;
}

const TaskList: React.FC<TaskListProps> = ({ teamId }) => {
  const { tasks, loading, updateTask, deleteTask, reorderTasks } = useTask();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('position');

  const handleToggleStatus = (id: string) => {
    const task = tasks.find(t => t._id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateTask(id, { status: newStatus });
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startIndex = source.index;
    const endIndex = destination.index;
    
    const reorderedTasks = Array.from(filteredTasks);
    const [removed] = reorderedTasks.splice(startIndex, 1);
    reorderedTasks.splice(endIndex, 0, removed);
    
    const updatedPositions = reorderedTasks.map((task, index) => ({
      id: task._id,
      position: index,
    }));
    
    reorderTasks(updatedPositions);
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      if (filter === 'completed') return task.status === 'completed';
      if (filter === 'pending') return task.status === 'pending';
      if (filter === 'high') return task.priority === 'High' || task.priority === 'Critical';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'position') return a.position - b.position;
      if (sortBy === 'priority') {
        const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          {teamId ? 'Team Tasks' : 'My Tasks'}
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-300 mr-2 text-sm">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-300 mr-2 text-sm">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-md border border-gray-300 dark:border-gray-600 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="position">Custom</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-1" /> 
            Add Task
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateTaskForm 
            teamId={teamId} 
            onClose={() => setShowForm(false)} 
          />
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {filter !== 'all'
              ? `No ${filter} tasks found. Try a different filter.`
              : 'Create your first task by clicking the "Add Task" button above.'}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredTasks.map((task, index) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    index={index}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default TaskList;