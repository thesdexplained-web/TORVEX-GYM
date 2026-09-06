import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/storage_service.dart';

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final sessions = StorageService.getOfflineSessions();

    return Scaffold(
      appBar: AppBar(
        title: const Text('PERFORMANCE ANALYTICS', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Weekly Volume Chart
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('WEEKLY VOLUME DENSITY', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                Text(
                  'Active training sets completed per day',
                  style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  height: 160,
                  child: BarChart(
                    BarChartData(
                      borderData: FlBorderData(show: false),
                      gridData: const FlGridData(show: false),
                      titlesData: FlTitlesData(
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (val, meta) {
                              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                              final i = val.toInt();
                              if (i >= 0 && i < days.length) {
                                return Text(days[i], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold));
                              }
                              return const SizedBox();
                            },
                          ),
                        ),
                      ),
                      barGroups: [
                        _bar(0, 14),
                        _bar(1, 18),
                        _bar(2, 0),
                        _bar(3, 22),
                        _bar(4, 16),
                        _bar(5, 20),
                        _bar(6, 8),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Achievements Unlocked
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('RECENT MILESTONES', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                const SizedBox(height: 12),
                _buildMilestoneRow('First Blood', 'Completed your inaugural workout', true, isDark),
                _buildMilestoneRow('Century Club', 'Logged over 100 sets', true, isDark),
                _buildMilestoneRow('Torvex Legend', '14 consecutive training days', false, isDark),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // History log
          const Text('RECORDED SESSIONS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          if (sessions.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.lightCard,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(child: Text('No recorded sessions yet. Go smash a workout!')),
            )
          else
            ...sessions.map((s) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.lightCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s['workoutTitle'] ?? 'Workout', style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text(
                          '${s['caloriesBurned'] ?? 0} kcal • ${(s['durationSeconds'] ?? 0) ~/ 60} mins',
                          style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )),
        ],
      ),
    );
  }

  BarChartGroupData _bar(int x, double y) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: y > 0 ? AppColors.primaryAmber : Colors.grey.withOpacity(0.2),
          width: 14,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildMilestoneRow(String title, String desc, bool unlocked, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(unlocked ? Icons.verified : Icons.lock_outline, color: unlocked ? AppColors.primaryAmber : Colors.grey),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Text(desc, style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
