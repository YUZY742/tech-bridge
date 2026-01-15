const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const { authenticate } = require('./auth');

// Get chat messages for a support
router.get('/:supportId', authenticate, async (req, res) => {
  try {
    const support = await Support.findById(req.params.supportId);

    if (!support) {
      return res.status(404).json({ message: 'Support not found' });
    }

    // Check authorization
    const isCompany = support.companyId.toString() === req.userId.toString();
    const circle = await require('../models/Circle').findById(support.circleId);
    const isCircleMember = circle && circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );

    if (!isCompany && !isCircleMember && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      chatRoomId: support.chatRoomId,
      messages: support.messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message (stored in database for history)
router.post('/:supportId/message', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const support = await Support.findById(req.params.supportId);

    if (!support) {
      return res.status(404).json({ message: 'Support not found' });
    }

    // Check authorization
    const isCompany = support.companyId.toString() === req.userId.toString();
    const circle = await require('../models/Circle').findById(support.circleId);
    const isCircleMember = circle && circle.members.some(
      m => m.userId.toString() === req.userId.toString()
    );

    if (!isCompany && !isCircleMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    support.messages.push({
      senderId: req.userId,
      message,
      timestamp: new Date()
    });

    await support.save();

    res.json(support.messages[support.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
