const express = require('express');
const router = express.Router();
const Circle = require('../models/Circle');
const Support = require('../models/Support');
const { authenticate } = require('./auth');

// Get student dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access dashboard' });
    }

    // Get circles where user is a member
    const myCircles = await Circle.find({
      'members.userId': req.userId
    })
    .populate('supporters.companyId', 'companyName industry')
    .sort({ updatedAt: -1 });

    // Get supports for user's circles
    const circleIds = myCircles.map(c => c._id);
    const supports = await Support.find({
      circleId: { $in: circleIds }
    })
    .populate('companyId', 'companyName industry')
    .populate('circleId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate statistics
    const totalCircles = myCircles.length;
    const totalSupports = supports.length;
    const activeSupports = supports.filter(s => 
      ['pending', 'approved'].includes(s.status)
    ).length;

    // Get user's activity logs from all circles
    const allActivityLogs = [];
    myCircles.forEach(circle => {
      circle.activityLogs
        .filter(log => log.userId.toString() === req.userId.toString())
        .forEach(log => {
          allActivityLogs.push({
            circleId: circle._id,
            circleName: circle.name,
            activity: log.activity,
            contribution: log.contribution,
            date: log.date
          });
        });
    });
    allActivityLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      stats: {
        totalCircles,
        totalSupports,
        activeSupports
      },
      myCircles,
      recentSupports: supports,
      recentActivities: allActivityLogs.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's circles
router.get('/circles', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this' });
    }

    const circles = await Circle.find({
      'members.userId': req.userId
    })
    .populate('members.userId', 'profile')
    .populate('supporters.companyId', 'companyName industry')
    .sort({ updatedAt: -1 });

    res.json(circles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's activity logs
router.get('/activities', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this' });
    }

    const circles = await Circle.find({
      'members.userId': req.userId
    });

    const activities = [];
    circles.forEach(circle => {
      circle.activityLogs
        .filter(log => log.userId.toString() === req.userId.toString())
        .forEach(log => {
          activities.push({
            circleId: circle._id,
            circleName: circle.name,
            activity: log.activity,
            contribution: log.contribution,
            date: log.date
          });
        });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
