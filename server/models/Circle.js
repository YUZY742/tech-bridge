const mongoose = require('mongoose');

const circleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['ロボコン', 'ロケット', '鳥人間', 'その他'],
    required: true
  },
  currentStatus: {
    type: String,
    required: true
  },
  achievements: [{
    contestName: String,
    year: Number,
    result: String,
    description: String
  }],
  techStack: {
    languages: [String],
    cad: [String],
    equipment: [String],
    other: [String]
  },
  needs: {
    funding: {
      amount: Number,
      purpose: String,
      required: Boolean
    },
    equipment: [{
      name: String,
      description: String,
      quantity: Number
    }],
    mentorship: {
      required: Boolean,
      areas: [String]
    }
  },
  portfolio: {
    githubRepos: [{
      url: String,
      description: String
    }],
    designDocuments: [{
      name: String,
      url: String,
      type: String
    }],
    experimentData: [{
      title: String,
      url: String,
      date: Date
    }],
    activityReports: [{
      title: String,
      url: String,
      date: Date
    }]
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    contributions: [String]
  }],
  activityLogs: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    activity: String,
    contribution: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  supporters: [{
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    supportType: {
      type: String,
      enum: ['funding', 'equipment', 'mentorship']
    },
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  region: {
    type: String,
    enum: ['関東', '関西', '中部', '九州', 'その他']
  },
  isRookie: {
    type: Boolean,
    default: false
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

// 検索用インデックス
circleSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });
circleSchema.index({ university: 1, region: 1, category: 1 });

// データ分析用インデックス
circleSchema.index({ createdAt: -1 }); // 時系列分析用
circleSchema.index({ 'members.userId': 1 }); // メンバー検索用
circleSchema.index({ 'activityLogs.date': -1 }); // 活動ログ分析用
circleSchema.index({ 'supporters.status': 1, 'supporters.createdAt': -1 }); // 支援状況分析用
circleSchema.index({ isRookie: 1, createdAt: -1 }); // 新規サークル分析用

module.exports = mongoose.model('Circle', circleSchema);
