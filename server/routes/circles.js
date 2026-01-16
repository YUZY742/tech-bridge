const express = require('express');
const router = express.Router();
const Circle = require('../models/Circle');
const { authenticate } = require('./auth');

// Get all circles with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      region,
      university,
      techStack,
      search,
      isRookie,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (region) query.region = region;
    if (university) query.university = new RegExp(university, 'i');
    if (isRookie !== undefined) query.isRookie = isRookie === 'true';
    if (techStack) query['techStack.languages'] = { $in: [techStack] };
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const circles = await Circle.find(query)
      .populate('members.userId', 'profile')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Circle.countDocuments(query);

    res.json({
      circles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get circle by ID
router.get('/:id', async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id)
      .populate('members.userId', 'profile')
      .populate('supporters.companyId', 'companyName industry');
    
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    res.json(circle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create circle
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can create circles' });
    }

    // Validation
    const { name, description, university, category, currentStatus } = req.body;
    if (!name || !description || !university || !category || !currentStatus) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, university, category, currentStatus' 
      });
    }

    if (!['ロボコン', 'ロケット', '鳥人間', 'その他'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const circleData = {
      name,
      description,
      university,
      category,
      currentStatus,
      techStack: req.body.techStack || {
        languages: [],
        cad: [],
        equipment: [],
        other: []
      },
      needs: req.body.needs || {
        funding: { amount: 0, purpose: '', required: false },
        equipment: [],
        mentorship: { required: false, areas: [] }
      },
      portfolio: {
        githubRepos: [],
        designDocuments: [],
        experimentData: [],
        activityReports: []
      },
      members: [{
        userId: req.userId,
        role: 'leader',
        contributions: []
      }],
      tags: req.body.tags || [],
      region: req.body.region || 'その他',
      isRookie: req.body.isRookie || false,
      achievements: req.body.achievements || []
    };

    const circle = new Circle(circleData);
    await circle.save();

    res.status(201).json(circle);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update circle
router.put('/:id', authenticate, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is a member
    const isMember = circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );
    if (!isMember && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(circle, req.body);
    circle.updatedAt = new Date();
    await circle.save();

    res.json(circle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to circle
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is already a member
    const isMember = circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // Only students can join circles
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can join circles' });
    }

    circle.members.push({
      userId: req.userId,
      role: 'member',
      contributions: []
    });

    await circle.save();
    res.json(circle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove member from circle
router.delete('/:id/members/:memberId', authenticate, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check authorization: user must be the member themselves, a leader, or admin
    const member = circle.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const isSelf = member.userId.toString() === req.userId.toString();
    const isLeader = circle.members.some(
      m => m.userId.toString() === req.userId.toString() && m.role === 'leader'
    );

    if (!isSelf && !isLeader && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Cannot remove the last leader
    if (member.role === 'leader' && circle.members.filter(m => m.role === 'leader').length === 1) {
      return res.status(400).json({ message: 'Cannot remove the last leader' });
    }

    circle.members.pull(req.params.memberId);
    await circle.save();

    res.json({ message: 'Member removed successfully', circle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update portfolio
router.put('/:id/portfolio', authenticate, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is a member
    const isMember = circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );
    if (!isMember && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.githubRepos) circle.portfolio.githubRepos = req.body.githubRepos;
    if (req.body.designDocuments) circle.portfolio.designDocuments = req.body.designDocuments;
    if (req.body.experimentData) circle.portfolio.experimentData = req.body.experimentData;
    if (req.body.activityReports) circle.portfolio.activityReports = req.body.activityReports;

    circle.updatedAt = new Date();
    await circle.save();

    res.json(circle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add activity log
router.post('/:id/activity', authenticate, async (req, res) => {
  try {
    const { activity, contribution } = req.body;
    
    if (!activity || !contribution) {
      return res.status(400).json({ message: 'Activity and contribution are required' });
    }

    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    const isMember = circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member' });
    }

    const activityLog = {
      userId: req.userId,
      activity,
      contribution,
      date: new Date()
    };

    circle.activityLogs.push(activityLog);

    // Update member's contributions
    const member = circle.members.find(
      m => m.userId.toString() === req.userId.toString()
    );
    if (member) {
      member.contributions.push(contribution);
    }

    await circle.save();
    
    res.json({
      message: 'Activity logged successfully',
      activityLog: circle.activityLogs[circle.activityLogs.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended circles (for diversity)
router.get('/recommendations/rookie', async (req, res) => {
  try {
    const circles = await Circle.find({ isRookie: true })
      .populate('members.userId', 'profile')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(circles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get circle statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    const stats = {
      totalMembers: circle.members.length,
      totalSupporters: circle.supporters.length,
      activeSupports: circle.supporters.filter(s => 
        ['pending', 'approved'].includes(s.status)
      ).length,
      totalActivityLogs: circle.activityLogs.length,
      totalPortfolioItems: 
        circle.portfolio.githubRepos.length +
        circle.portfolio.designDocuments.length +
        circle.portfolio.experimentData.length +
        circle.portfolio.activityReports.length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search circles with advanced filters
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      category,
      region,
      university,
      techStack,
      hasFunding,
      hasEquipment,
      hasMentorship,
      isRookie,
      minMembers,
      maxMembers,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (region) query.region = region;
    if (university) query.university = new RegExp(university, 'i');
    if (isRookie !== undefined) query.isRookie = isRookie === 'true';
    
    if (techStack) {
      query.$or = [
        { 'techStack.languages': { $in: Array.isArray(techStack) ? techStack : [techStack] } },
        { 'techStack.cad': { $in: Array.isArray(techStack) ? techStack : [techStack] } },
        { tags: { $in: Array.isArray(techStack) ? techStack : [techStack] } }
      ];
    }

    if (hasFunding === 'true') {
      query['needs.funding.required'] = true;
    }
    if (hasEquipment === 'true') {
      query['needs.equipment.0'] = { $exists: true };
    }
    if (hasMentorship === 'true') {
      query['needs.mentorship.required'] = true;
    }

    if (minMembers || maxMembers) {
      query['$expr'] = {
        $and: []
      };
      if (minMembers) {
        query['$expr']['$and'].push({ $gte: [{ $size: '$members' }, parseInt(minMembers)] });
      }
      if (maxMembers) {
        query['$expr']['$and'].push({ $lte: [{ $size: '$members' }, parseInt(maxMembers)] });
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

    const circles = await Circle.find(query)
      .populate('members.userId', 'profile')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Circle.countDocuments(query);

    res.json({
      circles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
