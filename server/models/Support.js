const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  circleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Circle',
    required: true
  },
  supportType: {
    type: String,
    enum: ['funding', 'equipment', 'mentorship', 'software'],
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  items: [{
    name: String,
    description: String,
    quantity: Number,
    value: Number
  }],
  purpose: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'disbursed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['grant', 'reimbursement'],
    default: 'grant'
  },
  taxHandling: {
    type: String,
    enum: ['gift-tax-free', 'expense-reimbursement'],
    default: 'gift-tax-free'
  },
  contractDocument: {
    url: String,
    generatedAt: Date
  },
  chatRoomId: {
    type: String,
    required: true
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  activityLogs: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    activity: String,
    contribution: String,
    date: Date
  }],
  guidelines: {
    type: String,
    default: '企業側は「サポーター」であり「管理職」ではないことを理解し、学生の自由な探究心を尊重する。'
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

supportSchema.index({ companyId: 1, circleId: 1 });
supportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Support', supportSchema);
