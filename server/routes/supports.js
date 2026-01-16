const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const Circle = require('../models/Circle');
const Company = require('../models/Company');
const { authenticate } = require('./auth');

// Create support request
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can create support' });
    }

    const { circleId, supportType, amount, items, purpose } = req.body;

    // Validation
    if (!circleId || !supportType) {
      return res.status(400).json({ message: 'Circle ID and support type are required' });
    }

    if (!['funding', 'equipment', 'mentorship', 'software'].includes(supportType)) {
      return res.status(400).json({ message: 'Invalid support type' });
    }

    // Check if circle exists
    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if company exists
    const company = await Company.findOne({ userId: req.userId });
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Generate chat room ID
    const chatRoomId = `support-${req.userId}-${circleId}-${Date.now()}`;

    const support = new Support({
      companyId: req.userId,
      circleId,
      supportType,
      amount: amount || 0,
      items: items || [],
      purpose: purpose || '',
      chatRoomId,
      status: 'pending'
    });

    await support.save();

    // Update circle supporters (avoid duplicates)
    const existingSupporter = circle.supporters.find(
      s => s.companyId.toString() === req.userId.toString() && 
           s.status === 'pending'
    );
    if (!existingSupporter) {
      circle.supporters.push({
        companyId: req.userId,
        supportType,
        amount: amount || 0,
        status: 'pending'
      });
      await circle.save();
    }

    // Update company supported circles (avoid duplicates)
    const existingSupport = company.supportedCircles.find(
      s => s.circleId.toString() === circleId.toString() && 
           s.status === 'pending'
    );
    if (!existingSupport) {
      company.supportedCircles.push({
        circleId,
        supportType,
        amount: amount || 0,
        status: 'pending',
        date: new Date()
      });
      await company.save();
    }

    res.status(201).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supports for company
router.get('/company', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can view supports' });
    }

    const supports = await Support.find({ companyId: req.userId })
      .populate('circleId', 'name description university')
      .sort({ createdAt: -1 });

    res.json(supports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supports for circle
router.get('/circle/:circleId', authenticate, async (req, res) => {
  try {
    const supports = await Support.find({ circleId: req.params.circleId })
      .populate('companyId', 'companyName industry')
      .sort({ createdAt: -1 });

    res.json(supports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update support status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['pending', 'approved', 'disbursed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const support = await Support.findById(req.params.id);

    if (!support) {
      return res.status(404).json({ message: 'Support not found' });
    }

    // Check authorization
    const isCompany = req.userRole === 'company' && 
                     support.companyId.toString() === req.userId.toString();
    const circle = await Circle.findById(support.circleId);
    const isCircleLeader = circle && circle.members.some(
      m => m.userId.toString() === req.userId.toString() && m.role === 'leader'
    );
    const isAdmin = req.userRole === 'admin';

    if (!isCompany && !isCircleLeader && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldStatus = support.status;
    support.status = status;
    support.updatedAt = new Date();
    await support.save();

    // Update circle and company records if status changed to approved/completed
    if (status === 'approved' || status === 'completed') {
      // Update circle supporters
      const circleSupporter = circle.supporters.find(
        s => s.companyId.toString() === support.companyId.toString()
      );
      if (circleSupporter) {
        circleSupporter.status = status;
        await circle.save();
      }

      // Update company supported circles
      const company = await Company.findOne({ userId: support.companyId });
      if (company) {
        const companySupport = company.supportedCircles.find(
          s => s.circleId.toString() === support.circleId.toString()
        );
        if (companySupport) {
          companySupport.status = status;
          await company.save();
        }
      }
    }

    res.json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate contract document (placeholder)
router.get('/:id/contract', authenticate, async (req, res) => {
  try {
    const support = await Support.findById(req.params.id)
      .populate('companyId', 'companyName')
      .populate('circleId', 'name university');

    if (!support) {
      return res.status(404).json({ message: 'Support not found' });
    }

    // In production, generate actual PDF contract
    const contractData = {
      supportId: support._id,
      companyName: support.companyId.companyName,
      circleName: support.circleId.name,
      supportType: support.supportType,
      amount: support.amount,
      items: support.items,
      guidelines: support.guidelines,
      generatedAt: new Date()
    };

    res.json(contractData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
