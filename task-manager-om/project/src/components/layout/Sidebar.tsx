import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, ListTodo, Users, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface Team {
  _id: string;
  name: string;
}

const Sidebar: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const res = await axios.get('/api/teams');
        setTeams(res.data.teams);
      } catch (err) {
        console.error('Failed to fetch teams', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [isAuthenticated]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) return;
    
    try {
      const res = await axios.post('/api/teams', {
        name: teamName,
      });
      
      setTeams([...teams, res.data.team]);
      setTeamName('');
      setShowCreateTeam(false);
      navigate(`/teams/${res.data.team._id}`);
    } catch (err) {
      console.error('Failed to create team', err);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-indigo-600 dark:bg-gray-800 text-white transition-all duration-200 shadow-lg">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <CheckSquare className="h-8 w-8" />
          <span className="text-2xl font-bold">TaskFlow</span>
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <ListTodo className="h-5 w-5 mr-3" />
            <span>My Tasks</span>
          </Link>
          
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Teams
              </h3>
              <button
                onClick={() => setShowCreateTeam(!showCreateTeam)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {showCreateTeam && (
              <form 
                onSubmit={handleCreateTeam}
                className="mt-2 px-4"
              >
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md"
                  required
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            <div className="mt-3 space-y-1">
              {loading ? (
                <div className="px-4 py-2 text-sm">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="px-4 py-2 text-sm">No teams yet</div>
              ) : (
                teams.map((team) => (
                  <Link
                    key={team._id}
                    to={`/teams/${team._id}`}
                    className="flex items-center px-4 py-2 text-white hover:bg-indigo-700 dark:hover:bg-gray-700 rounded-md text-sm transition-colors duration-200"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    <span>{team.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;