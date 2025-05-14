import Team from '../models/Team.js';
import User from '../models/User.js';

// Create a new team
export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const newTeam = new Team({
      name,
      description,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'team_lead',
        },
      ],
    });
    
    await newTeam.save();
    
    // Add team to user's teams
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { teams: newTeam._id } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: newTeam,
    });
  } catch (error) {
    next(error);
  }
};

// Get all teams for a user
export const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
    }).populate('members.user', 'username email');
    
    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single team
export const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'username email')
      .populate('createdBy', 'username email');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }
    
    // Check if user is a member
    const isMember = team.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );
    
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }
    
    res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    next(error);
  }
};

// Add a member to a team
export const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }
    
    // Check if user is team lead or admin
    const userMember = team.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if ((!userMember || userMember.role !== 'team_lead') && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add members',
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      member => member.user.toString() === userId
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team',
      });
    }
    
    // Add member to team
    team.members.push({
      user: userId,
      role: role || 'user',
    });
    
    await team.save();
    
    // Add team to user's teams
    await User.findByIdAndUpdate(
      userId,
      { $push: { teams: team._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      team,
    });
  } catch (error) {
    next(error);
  }
};

// Remove a member from a team
export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }
    
    // Check if user is team lead or admin
    const userMember = team.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if ((!userMember || userMember.role !== 'team_lead') && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove members',
      });
    }
    
    // Check if user is trying to remove self (team lead)
    if (userId === req.user._id.toString() && userMember.role === 'team_lead') {
      return res.status(400).json({
        success: false,
        message: 'Team lead cannot remove themselves. Transfer leadership first.',
      });
    }
    
    // Remove member from team
    team.members = team.members.filter(
      member => member.user.toString() !== userId
    );
    
    await team.save();
    
    // Remove team from user's teams
    await User.findByIdAndUpdate(
      userId,
      { $pull: { teams: team._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      team,
    });
  } catch (error) {
    next(error);
  }
};