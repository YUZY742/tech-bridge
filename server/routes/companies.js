const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Circle = require('../models/Circle');
const { authenticate } = require('./auth');

// Get company dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can access dashboard' });
    }

    const company = await Company.findOne({ userId: req.userId })
      .populate('supportedCircles.circleId');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get recommended circles based on tech focus
    const recommendedCircles = await Circle.find({
      $or: [
        { category: { $in: company.techFocus } },
        { 'techStack.languages': { $in: company.techFocus } },
        { tags: { $in: company.techFocus } }
      ],
      _id: { $nin: company.supportedCircles.map(s => s.circleId) }
    })
    .limit(10)
    .populate('members.userId', 'profile');

    res.json({
      company,
      recommendedCircles,
      stats: {
        totalSupported: company.supportedCircles.length,
        totalBudget: Object.values(company.budgetCategories).reduce(
          (sum, cat) => sum + cat.allocated, 0
        ),
        usedBudget: Object.values(company.budgetCategories).reduce(
          (sum, cat) => sum + cat.used, 0
        )
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search circles with filters
router.post('/search', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can search' });
    }

    const {
      categories,
      regions,
      techStack,
      budgetRange,
      searchText
    } = req.body;

    const query = {};

    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }
    if (regions && regions.length > 0) {
      query.region = { $in: regions };
    }
    if (techStack && techStack.length > 0) {
      query.$or = [
        { 'techStack.languages': { $in: techStack } },
        { 'techStack.cad': { $in: techStack } },
        { tags: { $in: techStack } }
      ];
    }
    if (budgetRange) {
      query['needs.funding.amount'] = {
        $gte: budgetRange.min || 0,
        $lte: budgetRange.max || Infinity
      };
    }
    if (searchText) {
      query.$text = { $search: searchText };
    }

    const circles = await Circle.find(query)
      .populate('members.userId', 'profile')
      .sort({ createdAt: -1 });

    res.json(circles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update company profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can update profile' });
    }

    const company = await Company.findOne({ userId: req.userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    Object.assign(company, req.body);
    company.updatedAt = new Date();
    await company.save();

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update KPIs
router.put('/kpis', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can update KPIs' });
    }

    const company = await Company.findOne({ userId: req.userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    Object.assign(company.kpis, req.body);
    await company.save();

    res.json(company.kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
