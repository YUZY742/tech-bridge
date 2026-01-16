// 将来の多角的評価システム用のデータモデル
const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // 基本評価スコア（現行）
  scores: {
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    technical: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    grit: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    contribution: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // 将来の評価軸（実装予定）
  advancedScores: {
    // 協調性・チームワーク
    collaboration: {
      communication: Number, // コミュニケーション能力
      leadership: Number,    // リーダーシップ
      mentorship: Number,    // メンターシップ
      teamwork: Number       // チームワーク
    },
    
    // 問題解決能力
    problemSolving: {
      problemIdentification: Number, // 課題発見能力
      solutionProcess: Number,       // 解決プロセス
      innovation: Number,            // イノベーション
      learningFromFailure: Number    // 失敗からの学習
    },
    
    // 学習・成長能力
    learning: {
      learningSpeed: Number,    // 学習速度
      adaptability: Number,     // 適応能力
      skillExpansion: Number,   // スキル拡張
      growthRate: Number        // 成長速度
    },
    
    // 専門性・深さ
    expertise: {
      depth: Number,           // 専門領域の深さ
      breadth: Number,         // 横断的な知識
      application: Number,     // 応用能力
      integration: Number      // 統合能力
    }
  },
  
  // 外部評価
  externalEvaluations: [{
    evaluatorType: {
      type: String,
      enum: ['company', 'mentor', 'peer', 'expert']
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'externalEvaluations.evaluatorType'
    },
    scores: {
      technical: Number,
      collaboration: Number,
      problemSolving: Number,
      communication: Number,
      overall: Number
    },
    feedback: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 評価データの詳細
  evaluationData: {
    // コード品質（GitHub API連携時）
    codeQuality: {
      repositories: Number,
      totalCommits: Number,
      codeReviewScore: Number,
      testCoverage: Number,
      documentationScore: Number
    },
    
    // 設計能力
    designAbility: {
      designDocuments: Number,
      designComplexity: Number,
      architectureScore: Number,
      designReviewScore: Number
    },
    
    // 実験・検証能力
    experimentalAbility: {
      experimentData: Number,
      dataAnalysisDepth: Number,
      verificationProcess: Number,
      reproducibility: Number
    },
    
    // 技術文書能力
    documentationAbility: {
      activityReports: Number,
      technicalDocuments: Number,
      presentationQuality: Number,
      explanationAbility: Number
    },
    
    // コミュニケーション能力（チャット分析）
    communicationAbility: {
      chatMessageCount: Number,
      responseTime: Number,
      messageQuality: Number,
      technicalExplanation: Number
    },
    
    // プロジェクト成果
    projectResults: {
      completedProjects: Number,
      goalAchievementRate: Number,
      budgetManagement: Number,
      qualityManagement: Number
    }
  },
  
  // 評価履歴（時系列データ）
  evaluationHistory: [{
    date: Date,
    scores: {
      overall: Number,
      technical: Number,
      grit: Number,
      contribution: Number
    },
    notes: String
  }],
  
  // メタデータ
  lastEvaluated: {
    type: Date,
    default: Date.now
  },
  evaluationVersion: {
    type: String,
    default: '1.0'
  },
  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// インデックス
evaluationSchema.index({ userId: 1 });
evaluationSchema.index({ 'scores.overall': -1 });
evaluationSchema.index({ lastEvaluated: -1 });

// 評価スコアの更新メソッド
evaluationSchema.methods.updateScores = function(newScores) {
  this.scores = { ...this.scores, ...newScores };
  this.lastEvaluated = new Date();
  this.updatedAt = new Date();
  
  // 評価履歴に追加
  this.evaluationHistory.push({
    date: new Date(),
    scores: { ...this.scores },
    notes: '自動評価更新'
  });
  
  // 履歴は最新100件まで保持
  if (this.evaluationHistory.length > 100) {
    this.evaluationHistory = this.evaluationHistory.slice(-100);
  }
};

// 外部評価の追加メソッド
evaluationSchema.methods.addExternalEvaluation = function(evaluation) {
  this.externalEvaluations.push(evaluation);
  this.updatedAt = new Date();
};

module.exports = mongoose.model('Evaluation', evaluationSchema);
