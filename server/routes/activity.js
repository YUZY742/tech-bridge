const express = require('express');
const router = express.Router();
const Circle = require('../models/Circle');
const Support = require('../models/Support');
const { authenticate } = require('./auth');

// Get activity logs for a circle
router.get('/circle/:circleId', authenticate, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.circleId);

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check authorization
    const isMember = circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );
    const supports = await Support.find({ circleId: req.params.circleId });
    const isSupporter = supports.some(
      s => s.companyId.toString() === req.userId.toString()
    );

    if (!isMember && !isSupporter && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(circle.activityLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity logs for a support
router.get('/support/:supportId', authenticate, async (req, res) => {
  try {
    const support = await Support.findById(req.params.supportId);

    if (!support) {
      return res.status(404).json({ message: 'Support not found' });
    }

    // Check authorization
    const isCompany = support.companyId.toString() === req.userId.toString();
    const circle = await Circle.findById(support.circleId);
    const isCircleMember = circle && circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );

    if (!isCompany && !isCircleMember && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(support.activityLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add activity log to support
router.post('/support/:supportId', authenticate, async (req, res) => {
  try {
    const { activity, contribution } = req.body;
    const support = await Support.findById(req.params.supportId);

    if (!support) {
      return res.status(404).json({ message: 'Support not found' });
    }

    const circle = await Circle.findById(support.circleId);
    const isCircleMember = circle && circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );

    if (!isCircleMember) {
      return res.status(403).json({ message: 'Only circle members can log activities' });
    }

    support.activityLogs.push({
      userId: req.userId,
      activity,
      contribution,
      date: new Date()
    });

    await support.save();
    res.json(support.activityLogs[support.activityLogs.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
