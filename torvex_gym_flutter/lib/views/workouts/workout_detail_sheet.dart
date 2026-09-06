import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../models/workout_model.dart';
import '../../core/constants/app_colors.dart';
import '../../bloc/active_workout/active_workout_bloc.dart';
import '../../bloc/active_workout/active_workout_event.dart';
import '../../bloc/subscription/subscription_bloc.dart';
import '../subscription/paywall_dialog.dart';
import '../active_workout/active_workout_screen.dart';

class WorkoutDetailSheet extends StatelessWidget {
  final Workout workout;

  const WorkoutDetailSheet({Key? key, required this.workout}) : super(key: key);

  static void show(BuildContext context, Workout workout) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => WorkoutDetailSheet(workout: workout),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isPro = context.watch<SubscriptionBloc>().state.isPro;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkBg : AppColors.lightBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Grab handle
              Center(
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black12,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    // Workout Header Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Stack(
                        children: [
                          CachedNetworkImage(
                            imageUrl: workout.imageUrl,
                            height: 220,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(color: Colors.grey.shade900),
                            errorWidget: (_, __, ___) => Container(
                              height: 220,
                              color: Colors.grey.shade900,
                              child: const Icon(Icons.fitness_center, size: 48),
                            ),
                          ),
                          Container(
                            height: 220,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.85),
                                ],
                              ),
                            ),
                          ),
                          Positioned(
                            top: 14,
                            left: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primaryAmber,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                workout.category.toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 14,
                            left: 14,
                            right: 14,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  workout.title,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.schedule, color: Colors.white70, size: 14),
                                    const SizedBox(width: 4),
                                    Text('${workout.durationMinutes} min', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                    const SizedBox(width: 14),
                                    const Icon(Icons.local_fire_department, color: AppColors.primaryAmber, size: 14),
                                    const SizedBox(width: 4),
                                    Text('${workout.estimatedCalories} kcal', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                    const SizedBox(width: 14),
                                    const Icon(Icons.bar_chart, color: Colors.white70, size: 14),
                                    const SizedBox(width: 4),
                                    Text(workout.difficulty, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      workout.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'ROUTINE MOVEMENTS',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 0.8),
                    ),
                    const SizedBox(height: 12),
                    ...workout.exercises.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final ex = entry.value;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkCard : AppColors.lightCard,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: AppColors.primaryAmber.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Center(
                                child: Text(
                                  '${idx + 1}',
                                  style: const TextStyle(
                                    color: AppColors.primaryAmber,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ex.exerciseName,
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    '${ex.sets} sets × ${ex.reps} reps • ${ex.weightKg > 0 ? "${ex.weightKg} kg" : "Bodyweight"} • ${ex.restSeconds}s rest',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
              // Bottom Action Button
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCardElevated : AppColors.lightCard,
                  border: Border(
                    top: BorderSide(
                      color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder,
                    ),
                  ),
                ),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryAmber,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    if (workout.isPremiumOnly && !isPro) {
                      Navigator.pop(context);
                      PaywallDialog.show(context);
                      return;
                    }
                    Navigator.pop(context);
                    context.read<ActiveWorkoutBloc>().add(StartActiveWorkoutEvent(workout));
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ActiveWorkoutScreen()),
                    );
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(workout.isPremiumOnly && !isPro ? Icons.lock : Icons.play_arrow_rounded, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        workout.isPremiumOnly && !isPro ? 'UNLOCK WITH TORVEX PRO' : 'START THIS ROUTINE',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
