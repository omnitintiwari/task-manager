import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Save, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';
import TaskList from '../components/tasks/TaskList';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

interface Team {
  _id: string;
  name: string;
  description: string;
  members: {
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    joinedAt: string;
  }[];
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

const TeamDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTasks } = useTask();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/teams/${id}`);
        setTeam(res.data.team);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch team');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
    
    // Fetch team tasks
    if (id) {
      getTasks(id);
    }
  }, [id, getTasks]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setAddingMember(true);
      setMemberError(null);
      
      const res = await axios.get(`/api/users?email=${email}`);
      
      if (!res.data.users || res.data.users.length === 0) {
        setMemberError('User not found');
        return;
      }
      
      const userToAdd = res.data.users[0];
      
      // Check if user is already a member
      const isAlreadyMember = team?.members.some(
        member => member.user._id === userToAdd._id
      );
      
      if (isAlreadyMember) {
        setMemberError('User is already a member of this team');
        return;
      }
      
      await axios.post(`/api/teams/${id}/members`, {
        userId: userToAdd._id,
        role,
      });
      
      // Refresh team data
      const updatedTeam = await axios.get(`/api/teams/${id}`);
      setTeam(updatedTeam.data.team);
      
      // Reset form
      setEmail('');
      setRole('user');
      setShowAddMember(false);
    } catch (err: any) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await axios.delete(`/api/teams/${id}/members`, {
        data: { userId },
      });
      
      // Update local state
      setTeam(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          members: prev.members.filter(
            member => member.user._id !== userId
          ),
        };
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-12 h-12 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
          Team not found
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
  
  // Check if user is team lead
  const isTeamLead = team.members.some(
    member => member.user._id === user?.id && member.role === 'team_lead'
  );
  
  const isAdmin = user?.role === 'admin';
  const canManageMembers = isTeamLead || isAdmin;

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {team.name}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList teamId={id} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Team Members
                </h2>
                {canManageMembers && (
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Member
                  </button>
                )}
              </div>
            </div>
            
            {showAddMember && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <form onSubmit={handleAddMember}>
                  {memberError && (
                    <div className="bg-red-50 dark:bg-red-900/30 p-2 mb-3 rounded text-sm text-red-700 dark:text-red-400">
                      {memberError}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        User Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Role
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="user">User</option>
                        <option value="team_lead">Team Lead</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="mr-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={addingMember}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={addingMember}
                      >
                        {addingMember ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <UserPlus className="h-4 w-4 mr-1" />
                        )}
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {team.members.map((member) => (
                <li key={member.user._id} className="px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3">
                          {member.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.user.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize">
                        {member.role}
                      </span>
                      
                      {canManageMembers && user?.id !== member.user._id && (
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          className="ml-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Team Details
              </h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Team Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {team.name}
                  </dd>
                </div>
                
                {team.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {team.description}
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created By
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {team.createdBy.username}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created On
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member Count
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {team.members.length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;