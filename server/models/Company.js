const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  description: String,
  techFocus: [String], // 流体力学、組み込みシステム、カーボン素材など
  budgetCategories: {
    recruitment: {
      allocated: Number,
      used: Number
    },
    rnd: {
      allocated: Number,
      used: Number
    },
    education: {
      allocated: Number,
      used: Number
    }
  },
  kpis: {
    internshipApplications: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    },
    jointResearchCount: {
      type: Number,
      default: 0
    },
    productFeedbackCount: {
      type: Number,
      default: 0
    }
  },
  supportedCircles: [{
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circle'
    },
    supportType: String,
    amount: Number,
    status: String,
    date: Date
  }],
  searchFilters: {
    categories: [String],
    regions: [String],
    techStack: [String],
    budgetRange: {
      min: Number,
      max: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', companySchema);
