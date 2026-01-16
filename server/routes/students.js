const express = require('express');
const router = express.Router();
const Circle = require('../models/Circle');
const Support = require('../models/Support');
const { authenticate } = require('./auth');

// Get student dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access dashboard' });
    }

    // Get circles where user is a member
    const myCircles = await Circle.find({
      'members.userId': req.userId
    })
    .populate('supporters.companyId', 'companyName industry')
    .sort({ updatedAt: -1 });

    // Get supports for user's circles
    const circleIds = myCircles.map(c => c._id);
    const supports = await Support.find({
      circleId: { $in: circleIds }
    })
    .populate('companyId', 'companyName industry')
    .populate('circleId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate statistics
    const totalCircles = myCircles.length;
    const totalSupports = supports.length;
    const activeSupports = supports.filter(s => 
      ['pending', 'approved'].includes(s.status)
    ).length;

    // Get user's activity logs from all circles
    const allActivityLogs = [];
    myCircles.forEach(circle => {
      circle.activityLogs
        .filter(log => log.userId.toString() === req.userId.toString())
        .forEach(log => {
          allActivityLogs.push({
            circleId: circle._id,
            circleName: circle.name,
            activity: log.activity,
            contribution: log.contribution,
            date: log.date
          });
        });
    });
    allActivityLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      stats: {
        totalCircles,
        totalSupports,
        activeSupports
      },
      myCircles,
      recentSupports: supports,
      recentActivities: allActivityLogs.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student evaluation score
router.get('/evaluation', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access evaluation' });
    }

    // Get circles where user is a member
    const myCircles = await Circle.find({
      'members.userId': req.userId
    })
    .populate('members.userId', 'profile');

    // Calculate evaluation metrics
    let totalContributions = 0;
    let totalActivities = 0;
    let totalPortfolioItems = 0;
    let activeDays = new Set();
    let techStackCount = new Set();
    let projectDuration = 0;

    myCircles.forEach(circle => {
      const member = circle.members.find(
        m => m.userId.toString() === req.userId.toString()
      );
      
      if (member) {
        // Contributions
        totalContributions += member.contributions?.length || 0;
        
        // Activities
        const myActivities = circle.activityLogs.filter(
          log => log.userId.toString() === req.userId.toString()
        );
        totalActivities += myActivities.length;
        
        myActivities.forEach(activity => {
          activeDays.add(new Date(activity.date).toDateString());
        });
        
        // Portfolio items
        if (circle.portfolio) {
          totalPortfolioItems += 
            (circle.portfolio.githubRepos?.length || 0) +
            (circle.portfolio.designDocuments?.length || 0) +
            (circle.portfolio.experimentData?.length || 0) +
            (circle.portfolio.activityReports?.length || 0);
        }
        
        // Tech stack
        if (circle.techStack) {
          circle.techStack.languages?.forEach(lang => techStackCount.add(lang));
          circle.techStack.cad?.forEach(cad => techStackCount.add(cad));
        }
        
        // Project duration (days since first activity)
        if (myActivities.length > 0) {
          const firstActivity = myActivities.reduce((earliest, current) => 
            new Date(current.date) < new Date(earliest.date) ? current : earliest
          );
          const daysSinceFirst = Math.floor(
            (new Date().getTime() - new Date(firstActivity.date).getTime()) / (1000 * 60 * 60 * 24)
          );
          projectDuration = Math.max(projectDuration, daysSinceFirst);
        }
      }
    });

    // Calculate scores (0-100 scale)
    
    // 1. Technical Score (技術力) - 多角的評価の準備
    // - Portfolio items: 30 points max (GitHub、設計図面、実験データ、活動報告書)
    // - Tech stack diversity: 20 points max
    // - Contributions: 25 points max
    // 将来の拡張: コード品質、設計能力、実装能力なども評価予定
    const technicalScore = Math.min(100, 
      Math.min(30, totalPortfolioItems * 5) +
      Math.min(20, techStackCount.size * 4) +
      Math.min(25, totalContributions * 2)
    );
    
    // 将来の拡張: 設計図面の質、実験データの質、技術文書の質なども評価
    // TODO: 設計図面の質評価（ファイルサイズ、詳細度など）
    // TODO: 実験データの質評価（データ量、分析の深さなど）
    // TODO: 技術文書の質評価（文書の長さ、構造化度など）

    // 2. Grit Score (継続性・やり抜く力)
    // - Active days: 40 points max
    // - Project duration: 30 points max
    // - Activity frequency: 30 points max
    const activeDaysCount = activeDays.size;
    const activityFrequency = activeDaysCount > 0 ? totalActivities / activeDaysCount : 0;
    const gritScore = Math.min(100,
      Math.min(40, activeDaysCount * 2) +
      Math.min(30, Math.min(projectDuration / 10, 30)) +
      Math.min(30, activityFrequency * 5)
    );

    // 3. Contribution Score (貢献度)
    // - Total contributions: 50 points max
    // - Activity quality (activities with detailed contributions): 30 points max
    // - Support received (indicates value): 20 points max
    const detailedContributions = myCircles.reduce((sum, circle) => {
      const member = circle.members.find(m => m.userId.toString() === req.userId.toString());
      return sum + (member?.contributions?.filter(c => c.length > 20).length || 0);
    }, 0);
    
    const supports = await Support.find({
      circleId: { $in: myCircles.map(c => c._id) }
    });
    const contributionScore = Math.min(100,
      Math.min(50, totalContributions * 5) +
      Math.min(30, detailedContributions * 3) +
      Math.min(20, supports.length * 2)
    );

    // Overall Score (weighted average)
    // 現段階: 技術力40%、継続性35%、貢献度25%
    // 将来の拡張: 協調性、問題解決能力、学習能力なども追加予定
    const overallScore = Math.round(
      technicalScore * 0.4 + 
      gritScore * 0.35 + 
      contributionScore * 0.25
    );
    
    // 将来の評価軸（実装予定）
    // TODO: 協調性スコア（コミュニケーション能力、リーダーシップ、メンターシップ）
    // TODO: 問題解決能力スコア（課題発見、解決プロセス、イノベーション）
    // TODO: 学習能力スコア（学習速度、適応能力）
    // TODO: 外部評価スコア（企業フィードバック、メンター評価、ピアレビュー）

    // Generate descriptions
    const getScoreDescription = (score) => {
      if (score >= 80) return '優秀';
      if (score >= 60) return '良好';
      if (score >= 40) return '普通';
      return '要改善';
    };

    const getTechnicalDetails = () => {
      const details = [];
      if (totalPortfolioItems > 0) details.push(`ポートフォリオ: ${totalPortfolioItems}件`);
      if (techStackCount.size > 0) details.push(`技術スタック: ${techStackCount.size}種類`);
      if (totalContributions > 0) details.push(`貢献: ${totalContributions}件`);
      return details.join('、') || 'データなし';
    };

    const getGritDetails = () => {
      const details = [];
      if (activeDaysCount > 0) details.push(`活動日数: ${activeDaysCount}日`);
      if (projectDuration > 0) details.push(`継続期間: ${Math.floor(projectDuration / 30)}ヶ月`);
      if (activityFrequency > 0) details.push(`活動頻度: ${activityFrequency.toFixed(1)}回/日`);
      return details.join('、') || 'データなし';
    };

    const getContributionDetails = () => {
      const details = [];
      if (totalContributions > 0) details.push(`総貢献: ${totalContributions}件`);
      if (detailedContributions > 0) details.push(`詳細貢献: ${detailedContributions}件`);
      if (supports.length > 0) details.push(`受けた支援: ${supports.length}件`);
      return details.join('、') || 'データなし';
    };

    res.json({
      overallScore,
      overallDescription: getScoreDescription(overallScore),
      technicalScore: Math.round(technicalScore),
      technicalDetails: getTechnicalDetails(),
      gritScore: Math.round(gritScore),
      gritDetails: getGritDetails(),
      contributionScore: Math.round(contributionScore),
      contributionDetails: getContributionDetails(),
      metrics: {
        totalContributions,
        totalActivities,
        totalPortfolioItems,
        activeDays: activeDaysCount,
        techStackCount: techStackCount.size,
        projectDuration: Math.floor(projectDuration / 30), // months
        supportsReceived: supports.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's circles
router.get('/circles', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this' });
    }

    const circles = await Circle.find({
      'members.userId': req.userId
    })
    .populate('members.userId', 'profile')
    .populate('supporters.companyId', 'companyName industry')
    .sort({ updatedAt: -1 });

    res.json(circles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's activity logs
router.get('/activities', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this' });
    }

    const circles = await Circle.find({
      'members.userId': req.userId
    });

    const activities = [];
    circles.forEach(circle => {
      circle.activityLogs
        .filter(log => log.userId.toString() === req.userId.toString())
        .forEach(log => {
          activities.push({
            circleId: circle._id,
            circleName: circle.name,
            activity: log.activity,
            contribution: log.contribution,
            date: log.date
          });
        });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
