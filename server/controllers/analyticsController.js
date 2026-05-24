const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  // Base match condition for BDA role
  const leadMatch = userRole === 'bda' ? { assignedTo: userId } : {};
  const taskMatch = userRole === 'bda' ? { assignedTo: userId } : {};

  // Run all queries in parallel
  const [
    totalLeads,
    activeLeads,
    wonDeals,
    lostDeals,
    revenueResult,
    monthlyConversions,
    leadsBySource,
    leadsByStatus,
    recentActivities,
    upcomingFollowUps,
  ] = await Promise.all([
    // Total leads count
    Lead.countDocuments(leadMatch),

    // Active leads (not Won/Lost)
    Lead.countDocuments({
      ...leadMatch,
      status: { $nin: ['Won', 'Lost'] },
    }),

    // Won deals count
    Lead.countDocuments({ ...leadMatch, status: 'Won' }),

    // Lost deals count
    Lead.countDocuments({ ...leadMatch, status: 'Lost' }),

    // Total revenue from won deals
    Lead.aggregate([
      { $match: { ...leadMatch, status: 'Won' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$expectedRevenue' },
        },
      },
    ]),

    // Monthly conversions (last 12 months)
    Lead.aggregate([
      {
        $match: {
          ...leadMatch,
          status: 'Won',
          updatedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$expectedRevenue' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          revenue: 1,
        },
      },
    ]),

    // Leads by source
    Lead.aggregate([
      { $match: leadMatch },
      {
        $group: {
          _id: '$leadSource',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          source: '$_id',
          count: 1,
        },
      },
    ]),

    // Leads by status
    Lead.aggregate([
      { $match: leadMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]),

    // Recent activities (last 10)
    Activity.find(userRole === 'bda' ? { user: userId } : {})
      .populate('user', 'name email avatar')
      .populate('relatedLead', 'companyName')
      .populate('relatedTask', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    // Upcoming follow-ups (next 7 days)
    Lead.find({
      ...leadMatch,
      followUpDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      status: { $nin: ['Won', 'Lost'] },
    })
      .populate('assignedTo', 'name email avatar')
      .sort({ followUpDate: 1 })
      .limit(10)
      .lean(),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    data: {
      totalLeads,
      activeLeads,
      wonDeals,
      lostDeals,
      totalRevenue,
      conversionRate:
        totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(1) : 0,
      monthlyConversions,
      leadsBySource,
      leadsByStatus,
      recentActivities,
      upcomingFollowUps,
    },
  });
});

/**
 * @desc    Get team performance stats
 * @route   GET /api/analytics/team
 * @access  Private (Admin/Manager)
 */
const getTeamPerformance = asyncHandler(async (req, res) => {
  const teamStats = await Lead.aggregate([
    {
      $group: {
        _id: '$assignedTo',
        totalLeads: { $sum: 1 },
        wonLeads: {
          $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] },
        },
        lostLeads: {
          $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] },
        },
        activeLeads: {
          $sum: {
            $cond: [
              { $not: { $in: ['$status', ['Won', 'Lost']] } },
              1,
              0,
            ],
          },
        },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Won'] }, '$expectedRevenue', 0],
          },
        },
        avgDealSize: {
          $avg: {
            $cond: [{ $eq: ['$status', 'Won'] }, '$expectedRevenue', null],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        role: '$user.role',
        totalLeads: 1,
        wonLeads: 1,
        lostLeads: 1,
        activeLeads: 1,
        totalRevenue: 1,
        avgDealSize: { $ifNull: ['$avgDealSize', 0] },
        conversionRate: {
          $cond: [
            { $gt: ['$totalLeads', 0] },
            {
              $multiply: [
                { $divide: ['$wonLeads', '$totalLeads'] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // Also get task stats per user
  const taskStats = await Task.aggregate([
    {
      $group: {
        _id: '$assignedTo',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
        },
        pendingTasks: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Pending', 'InProgress']] },
              1,
              0,
            ],
          },
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $in: ['$status', ['Pending', 'InProgress']] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Merge task stats into team stats
  const taskStatsMap = {};
  taskStats.forEach((ts) => {
    taskStatsMap[ts._id.toString()] = ts;
  });

  const mergedStats = teamStats.map((member) => {
    const ts = taskStatsMap[member.userId.toString()] || {};
    return {
      ...member,
      totalTasks: ts.totalTasks || 0,
      completedTasks: ts.completedTasks || 0,
      pendingTasks: ts.pendingTasks || 0,
      overdueTasks: ts.overdueTasks || 0,
    };
  });

  res.status(200).json({
    success: true,
    data: mergedStats,
  });
});

/**
 * @desc    Get leaderboard (top BDAs by revenue)
 * @route   GET /api/analytics/leaderboard
 * @access  Private
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await Lead.aggregate([
    { $match: { status: 'Won' } },
    {
      $group: {
        _id: '$assignedTo',
        totalRevenue: { $sum: '$expectedRevenue' },
        dealsWon: { $sum: 1 },
        avgDealSize: { $avg: '$expectedRevenue' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        role: '$user.role',
        totalRevenue: 1,
        dealsWon: 1,
        avgDealSize: { $round: ['$avgDealSize', 2] },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
  ]);

  // Add rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  res.status(200).json({
    success: true,
    data: rankedLeaderboard,
  });
});

/**
 * @desc    Get monthly trends for last 12 months
 * @route   GET /api/analytics/trends
 * @access  Private
 */
const getTrends = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const userMatch =
    req.user.role === 'bda' ? { assignedTo: req.user._id } : {};

  // Leads created per month
  const leadsCreated = await Lead.aggregate([
    {
      $match: {
        ...userMatch,
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Deals won per month
  const dealsWon = await Lead.aggregate([
    {
      $match: {
        ...userMatch,
        status: 'Won',
        updatedAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        count: { $sum: 1 },
        revenue: { $sum: '$expectedRevenue' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Build complete 12-month timeline
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      monthName: date.toLocaleString('default', { month: 'short' }),
    });
  }

  const trends = months.map((m) => {
    const created = leadsCreated.find(
      (l) => l._id.year === m.year && l._id.month === m.month
    );
    const won = dealsWon.find(
      (w) => w._id.year === m.year && w._id.month === m.month
    );

    return {
      year: m.year,
      month: m.month,
      monthName: m.monthName,
      leadsCreated: created ? created.count : 0,
      dealsWon: won ? won.count : 0,
      revenue: won ? won.revenue : 0,
    };
  });

  res.status(200).json({
    success: true,
    data: trends,
  });
});

module.exports = {
  getDashboardStats,
  getTeamPerformance,
  getLeaderboard,
  getTrends,
};
