const express = require('express');
const router = express.Router();
const Circle = require('../models/Circle');
const User = require('../models/User');
const Company = require('../models/Company');
const Support = require('../models/Support');
const { authenticate } = require('./auth');

// プラットフォーム全体の統計情報（管理者用）
router.get('/platform', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access platform analytics' });
    }

    const [
      totalUsers,
      totalStudents,
      totalCompanies,
      totalCircles,
      totalSupports,
      activeSupports,
      totalFunding
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'company' }),
      Circle.countDocuments(),
      Support.countDocuments(),
      Support.countDocuments({ status: { $in: ['pending', 'approved'] } }),
      Support.aggregate([
        { $match: { supportType: 'funding', status: { $in: ['approved', 'disbursed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // カテゴリ別サークル数
    const circlesByCategory = await Circle.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 地域別サークル数
    const circlesByRegion = await Circle.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);

    // 月別新規登録数（過去6ヶ月）
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 支援タイプ別統計
    const supportsByType = await Support.aggregate([
      { $group: { _id: '$supportType', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalCompanies,
        totalCircles,
        totalSupports,
        activeSupports,
        totalFunding: totalFunding[0]?.total || 0
      },
      circlesByCategory,
      circlesByRegion,
      monthlyRegistrations,
      supportsByType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 学生の評価スコア分布
router.get('/evaluation-distribution', authenticate, async (req, res) => {
  try {
    if (req.userRole !== 'admin' && req.userRole !== 'company') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // すべての学生の評価スコアを計算
    const students = await User.find({ role: 'student' });
    const scores = [];

    for (const student of students) {
      const circles = await Circle.find({ 'members.userId': student._id });
      
      let totalContributions = 0;
      let totalActivities = 0;
      let totalPortfolioItems = 0;
      let activeDays = new Set();
      let techStackCount = new Set();
      let projectDuration = 0;

      circles.forEach(circle => {
        const member = circle.members.find(m => m.userId.toString() === student._id.toString());
        if (member) {
          totalContributions += member.contributions?.length || 0;
          const myActivities = circle.activityLogs.filter(
            log => log.userId.toString() === student._id.toString()
          );
          totalActivities += myActivities.length;
          myActivities.forEach(activity => {
            activeDays.add(new Date(activity.date).toDateString());
          });
          if (circle.portfolio) {
            totalPortfolioItems += 
              (circle.portfolio.githubRepos?.length || 0) +
              (circle.portfolio.designDocuments?.length || 0) +
              (circle.portfolio.experimentData?.length || 0) +
              (circle.portfolio.activityReports?.length || 0);
          }
          if (circle.techStack) {
            circle.techStack.languages?.forEach(lang => techStackCount.add(lang));
            circle.techStack.cad?.forEach(cad => techStackCount.add(cad));
          }
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

      const technicalScore = Math.min(100, 
        Math.min(30, totalPortfolioItems * 5) +
        Math.min(20, techStackCount.size * 4) +
        Math.min(25, totalContributions * 2)
      );

      const activeDaysCount = activeDays.size;
      const activityFrequency = activeDaysCount > 0 ? totalActivities / activeDaysCount : 0;
      const gritScore = Math.min(100,
        Math.min(40, activeDaysCount * 2) +
        Math.min(30, Math.min(projectDuration / 10, 30)) +
        Math.min(30, activityFrequency * 5)
      );

      const supports = await Support.find({
        circleId: { $in: circles.map(c => c._id) }
      });
      const detailedContributions = circles.reduce((sum, circle) => {
        const member = circle.members.find(m => m.userId.toString() === student._id.toString());
        return sum + (member?.contributions?.filter(c => c.length > 20).length || 0);
      }, 0);
      
      const contributionScore = Math.min(100,
        Math.min(50, totalContributions * 5) +
        Math.min(30, detailedContributions * 3) +
        Math.min(20, supports.length * 2)
      );

      const overallScore = Math.round(
        technicalScore * 0.4 + 
        gritScore * 0.35 + 
        contributionScore * 0.25
      );

      scores.push({
        studentId: student._id,
        email: student.email,
        name: student.profile?.name,
        university: student.profile?.university,
        overallScore,
        technicalScore: Math.round(technicalScore),
        gritScore: Math.round(gritScore),
        contributionScore: Math.round(contributionScore)
      });
    }

    // スコア分布を計算
    const distribution = {
      excellent: scores.filter(s => s.overallScore >= 80).length,
      good: scores.filter(s => s.overallScore >= 60 && s.overallScore < 80).length,
      average: scores.filter(s => s.overallScore >= 40 && s.overallScore < 60).length,
      needsImprovement: scores.filter(s => s.overallScore < 40).length
    };

    // 平均スコア
    const avgOverall = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length 
      : 0;
    const avgTechnical = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.technicalScore, 0) / scores.length
      : 0;
    const avgGrit = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.gritScore, 0) / scores.length
      : 0;
    const avgContribution = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.contributionScore, 0) / scores.length
      : 0;

    res.json({
      distribution,
      averages: {
        overall: Math.round(avgOverall),
        technical: Math.round(avgTechnical),
        grit: Math.round(avgGrit),
        contribution: Math.round(avgContribution)
      },
      topStudents: scores
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 企業別の支援統計
router.get('/company/:companyId', authenticate, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.params.companyId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // 自分の会社のデータのみアクセス可能
    if (req.userRole === 'company' && req.userId.toString() !== req.params.companyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const supports = await Support.find({ companyId: req.params.companyId });
    
    const stats = {
      totalSupports: supports.length,
      byStatus: {
        pending: supports.filter(s => s.status === 'pending').length,
        approved: supports.filter(s => s.status === 'approved').length,
        disbursed: supports.filter(s => s.status === 'disbursed').length,
        completed: supports.filter(s => s.status === 'completed').length,
        cancelled: supports.filter(s => s.status === 'cancelled').length
      },
      byType: {
        funding: supports.filter(s => s.supportType === 'funding').length,
        equipment: supports.filter(s => s.supportType === 'equipment').length,
        mentorship: supports.filter(s => s.supportType === 'mentorship').length,
        software: supports.filter(s => s.supportType === 'software').length
      },
      totalAmount: supports
        .filter(s => s.supportType === 'funding')
        .reduce((sum, s) => sum + (s.amount || 0), 0),
      averageAmount: supports
        .filter(s => s.supportType === 'funding' && s.amount > 0)
        .reduce((sum, s, _, arr) => sum + (s.amount || 0) / arr.length, 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
