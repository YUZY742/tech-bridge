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

    const circleData = {
      ...req.body,
      members: [{
        userId: req.userId,
        role: 'leader',
        contributions: []
      }]
    };

    const circle = new Circle(circleData);
    await circle.save();

    res.status(201).json(circle);
  } catch (error) {
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

// Add activity log
router.post('/:id/activity', authenticate, async (req, res) => {
  try {
    const { activity, contribution } = req.body;
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

    circle.activityLogs.push({
      userId: req.userId,
      activity,
      contribution,
      date: new Date()
    });

    await circle.save();
    res.json(circle);
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

module.exports = router;
