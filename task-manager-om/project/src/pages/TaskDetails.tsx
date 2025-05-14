import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Save, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  reminderDate: string;
  assignedTo: { _id: string; username: string } | null;
  createdBy: { _id: string; username: string };
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  username: string;
}

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/tasks/${id}`);
        setTask(res.data.task);
        
        // Set form values
        setTitle(res.data.task.title);
        setDescription(res.data.task.description || '');
        setStatus(res.data.task.status);
        setPriority(res.data.task.priority);
        
        if (res.data.task.dueDate) {
          setDueDate(new Date(res.data.task.dueDate).toISOString().split('T')[0]);
        }
        
        if (res.data.task.reminderDate) {
          setReminderDate(new Date(res.data.task.reminderDate).toISOString().split('T')[0]);
        }
        
        if (res.data.task.assignedTo) {
          setAssignedUser(res.data.task.assignedTo._id);
        }
        
        // Fetch team users if task has a team
        if (res.data.task.team) {
          fetchTeamUsers(res.data.task.team);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch task');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);
  
  const fetchTeamUsers = async (teamId: string) => {
    try {
      const res = await axios.get(`/api/teams/${teamId}`);
      const members = res.data.team.members.map((member: any) => ({
        _id: member.user._id,
        username: member.user.username,
      }));
      setTeamUsers(members);
    } catch (err) {
      console.error('Failed to fetch team users', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      const taskData = {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        reminderDate: reminderDate ? new Date(reminderDate).toISOString() : undefined,
        assignedTo: assignedUser || undefined,
      };
      
      await axios.patch(`/api/tasks/${id}`, taskData);
      
      // Update local state
      setTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...taskData,
        };
      });
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setUpdating(true);
      await axios.delete(`/api/tasks/${id}`);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
          Task not found
        </h2>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to dashboard
        </button>
      </div>
    );
  }

  const isCreator = task.createdBy._id === user?.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isCreator || isAdmin;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Details
          </h1>
        </div>
        
        {canEdit && !deleteConfirm && (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={updating}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </button>
        )}
        
        {deleteConfirm && (
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={updating}
            >
              Confirm
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={updating}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {canEdit ? 'Edit Task' : 'View Task'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Created by {task.createdBy.username} on{' '}
            {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canEdit || updating}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="sm:col-span-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit || updating}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="sm:col-span-3">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'completed')}
                  disabled={!canEdit || updating}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
                  disabled={!canEdit || updating}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canEdit || updating}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="sm:col-span-3">
                <label
                  htmlFor="reminderDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reminder Date
                </label>
                <input
                  type="date"
                  id="reminderDate"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  disabled={!canEdit || updating}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {teamUsers.length > 0 && (
                <div className="sm:col-span-6">
                  <label
                    htmlFor="assignedUser"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Assigned To
                  </label>
                  <select
                    id="assignedUser"
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                    disabled={!canEdit || updating}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Not assigned</option>
                    {teamUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {canEdit && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={updating}
              >
                {updating ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;