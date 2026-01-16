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

// データ分析用インデックス
companySchema.index({ industry: 1 }); // 業界別分析用
companySchema.index({ 'supportedCircles.status': 1 }); // 支援状況分析用
companySchema.index({ createdAt: -1 }); // 時系列分析用

module.exports = mongoose.model('Company', companySchema);
