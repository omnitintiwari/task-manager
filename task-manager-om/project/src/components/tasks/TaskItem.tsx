import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate?: string;
  position: number;
}

interface TaskItemProps {
  task: Task;
  index: number;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  index, 
  onToggleStatus, 
  onDelete 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-3 border-l-4 ${
            task.status === 'completed'
              ? 'border-green-500 dark:border-green-600'
              : task.priority === 'Critical'
              ? 'border-red-500 dark:border-red-600'
              : task.priority === 'High'
              ? 'border-orange-500 dark:border-orange-600'
              : task.priority === 'Medium'
              ? 'border-blue-500 dark:border-blue-600'
              : 'border-green-500 dark:border-green-600'
          } transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => onToggleStatus(task._id)}
                className={`mt-1 text-${
                  task.status === 'completed' ? 'green' : 'gray'
                }-500 hover:text-green-600 focus:outline-none transition-colors duration-200`}
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1">
                <h3
                  className={`text-gray-900 dark:text-white font-medium ${
                    task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <Link
                to={`/tasks/${task._id}`}
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
              >
                <Edit className="h-4 w-4" />
              </Link>
              {showDeleteConfirm ? (
                <div className="flex space-x-1">
                  <button
                    onClick={() => onDelete(task._id)}
                    className="text-red-500 hover:text-red-600 focus:outline-none"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-500 hover:text-gray-600 focus:outline-none"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;