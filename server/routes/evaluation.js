// 将来の多角的評価システム用のエンドポイント
const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Circle = require('../models/Circle');
const Support = require('../models/Support');
const { authenticate } = require('./auth');

// 多角的評価スコアの取得（将来実装）
router.get('/advanced', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access evaluation' });
    }

    // 評価データを取得または作成
    let evaluation = await Evaluation.findOne({ userId: req.userId });
    
    if (!evaluation) {
      // 初回評価の場合は基本評価を計算
      evaluation = await calculateBasicEvaluation(req.userId);
    }

    res.json({
      scores: evaluation.scores,
      advancedScores: evaluation.advancedScores,
      externalEvaluations: evaluation.externalEvaluations,
      evaluationData: evaluation.evaluationData,
      lastEvaluated: evaluation.lastEvaluated,
      roadmap: {
        message: '多角的評価システムは段階的に実装予定です',
        currentPhase: 'Phase 1: 基本評価（完了）',
        nextPhase: 'Phase 2: 多角的評価の基盤構築（予定）',
        plannedFeatures: [
          '協調性・チームワーク評価',
          '問題解決能力評価',
          '学習・成長能力評価',
          '外部評価（企業、メンター、ピアレビュー）',
          'GitHub API連携によるコード品質評価',
          'チャット履歴分析によるコミュニケーション能力評価',
          '設計図面・実験データの質評価'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 外部評価の追加（企業、メンター、ピアレビュー用）
router.post('/external', authenticate, async (req, res) => {
  try {
    const { evaluatorType, scores, feedback } = req.body;

    if (!evaluatorType || !scores) {
      return res.status(400).json({ message: 'Evaluator type and scores are required' });
    }

    if (!['company', 'mentor', 'peer', 'expert'].includes(evaluatorType)) {
      return res.status(400).json({ message: 'Invalid evaluator type' });
    }

    // 評価対象の学生ID（管理者または評価者が指定）
    const targetUserId = req.body.targetUserId || req.userId;

    let evaluation = await Evaluation.findOne({ userId: targetUserId });
    
    if (!evaluation) {
      evaluation = new Evaluation({ userId: targetUserId });
    }

    // 外部評価を追加
    evaluation.addExternalEvaluation({
      evaluatorType,
      evaluatorId: req.userId,
      scores,
      feedback: feedback || '',
      date: new Date()
    });

    await evaluation.save();

    res.json({
      message: 'External evaluation added successfully',
      evaluation: evaluation.externalEvaluations[evaluation.externalEvaluations.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 評価履歴の取得
router.get('/history', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access evaluation history' });
    }

    const evaluation = await Evaluation.findOne({ userId: req.userId });

    if (!evaluation) {
      return res.json({ history: [] });
    }

    res.json({
      history: evaluation.evaluationHistory,
      trend: calculateTrend(evaluation.evaluationHistory)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 評価比較（同世代との比較）
router.get('/compare', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access comparison' });
    }

    const userEvaluation = await Evaluation.findOne({ userId: req.userId });
    
    if (!userEvaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // 同世代（同じ大学、同じカテゴリ）の評価を取得
    const user = await require('../models/User').findById(req.userId);
    const userCircles = await Circle.find({ 'members.userId': req.userId });
    
    const peerUserIds = [];
    for (const circle of userCircles) {
      for (const member of circle.members) {
        if (member.userId.toString() !== req.userId.toString()) {
          peerUserIds.push(member.userId);
        }
      }
    }

    const peerEvaluations = await Evaluation.find({
      userId: { $in: peerUserIds }
    }).limit(10);

    // 統計を計算
    const peerScores = peerEvaluations.map(e => e.scores.overall);
    const average = peerScores.length > 0
      ? peerScores.reduce((sum, score) => sum + score, 0) / peerScores.length
      : 0;
    const median = peerScores.length > 0
      ? peerScores.sort((a, b) => a - b)[Math.floor(peerScores.length / 2)]
      : 0;

    res.json({
      userScore: userEvaluation.scores.overall,
      peerAverage: Math.round(average),
      peerMedian: Math.round(median),
      percentile: calculatePercentile(userEvaluation.scores.overall, peerScores),
      comparison: {
        aboveAverage: userEvaluation.scores.overall > average,
        aboveMedian: userEvaluation.scores.overall > median
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ヘルパー関数

async function calculateBasicEvaluation(userId) {
  // 基本的な評価計算（既存のロジックを使用）
  // これは既存の /api/students/evaluation のロジックを再利用
  const evaluation = new Evaluation({
    userId,
    scores: {
      overall: 0,
      technical: 0,
      grit: 0,
      contribution: 0
    }
  });
  
  // 実際の計算は既存のロジックを呼び出す
  // ここでは簡略化
  return evaluation;
}

function calculateTrend(history) {
  if (history.length < 2) {
    return { trend: 'stable', change: 0 };
  }

  const recent = history.slice(-3);
  const older = history.slice(0, -3);

  if (older.length === 0) {
    return { trend: 'stable', change: 0 };
  }

  const recentAvg = recent.reduce((sum, h) => sum + h.scores.overall, 0) / recent.length;
  const olderAvg = older.reduce((sum, h) => sum + h.scores.overall, 0) / older.length;

  const change = recentAvg - olderAvg;

  return {
    trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    change: Math.round(change)
  };
}

function calculatePercentile(score, scores) {
  if (scores.length === 0) return 50;
  
  const sorted = [...scores].sort((a, b) => a - b);
  const below = sorted.filter(s => s < score).length;
  
  return Math.round((below / scores.length) * 100);
}

module.exports = router;
