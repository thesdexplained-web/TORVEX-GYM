import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../bloc/active_workout/active_workout_bloc.dart';
import '../../bloc/active_workout/active_workout_event.dart';
import '../../bloc/active_workout/active_workout_state.dart';

class ActiveWorkoutScreen extends StatelessWidget {
  const ActiveWorkoutScreen({Key? key}) : super(key: key);

  String _formatDuration(int totalSeconds) {
    final m = totalSeconds ~/ 60;
    final s = totalSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return BlocConsumer<ActiveWorkoutBloc, ActiveWorkoutState>(
      listener: (context, state) {
        if (state.status == ActiveWorkoutStatus.completed) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Session Complete & Synced! 🏆'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      },
      builder: (context, state) {
        final workout = state.currentWorkout;
        final exercise = state.currentExercise;

        if (workout == null || exercise == null) {
          return const Scaffold(body: Center(child: Text('No active workout session')));
        }

        return Scaffold(
          backgroundColor: isDark ? AppColors.darkBg : AppColors.lightBg,
          appBar: AppBar(
            automaticallyImplyLeading: false,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  workout.title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                ),
                Text(
                  '${_formatDuration(state.elapsedSeconds)} • ~${state.burnedCalories} kcal',
                  style: const TextStyle(fontSize: 12, color: AppColors.primaryAmber),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  _showQuitConfirmation(context);
                },
                child: const Text('FINISH', style: TextStyle(color: AppColors.primaryAmber, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          body: Column(
            children: [
              // Rest Timer Banner (if running)
              if (state.restRemainingSeconds > 0)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                  color: AppColors.primaryAmber,
                  child: Row(
                    children: [
                      const Icon(Icons.timer_outlined, color: Colors.black),
                      const SizedBox(width: 10),
                      Text(
                        'REST PERIOD: ${state.restRemainingSeconds}s',
                        style: const TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          context.read<ActiveWorkoutBloc>().add(const StartRestTimerEvent(0));
                        },
                        child: const Text('SKIP', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Exercise Info Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkCard : AppColors.lightCard,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'EXERCISE ${state.currentExerciseIndex + 1} OF ${workout.exercises.length}',
                                style: TextStyle(
                                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryAmber.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '${exercise.restSeconds}s Rest',
                                  style: const TextStyle(color: AppColors.primaryAmber, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            exercise.exerciseName,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 4),
                          Wrap(
                            spacing: 6,
                            children: exercise.targetMuscles.map((m) => Chip(
                              label: Text(m, style: const TextStyle(fontSize: 10)),
                              padding: EdgeInsets.zero,
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              backgroundColor: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                            )).toList(),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text('LOG SETS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
                    const SizedBox(height: 12),
                    // Sets table header
                    Row(
                      children: [
                        const SizedBox(width: 40, child: Text('SET', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                        const Expanded(child: Center(child: Text('KG', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)))),
                        const Expanded(child: Center(child: Text('REPS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)))),
                        const SizedBox(width: 50, child: Center(child: Text('DONE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)))),
                      ],
                    ),
                    const Divider(),
                    ...state.currentSets.asMap().entries.map((entry) {
                      final setIdx = entry.key;
                      final setItem = entry.value;

                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                        decoration: BoxDecoration(
                          color: setItem.completed
                              ? AppColors.primaryAmber.withOpacity(0.1)
                              : (isDark ? AppColors.darkCard : AppColors.lightCard),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: setItem.completed
                                ? AppColors.primaryAmber
                                : (isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
                          ),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 40,
                              child: Text(
                                '#${setItem.setNumber}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                            Expanded(
                              child: Center(
                                child: Text(
                                  '${setItem.weightKg} kg',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Center(
                                child: Text(
                                  '${setItem.reps}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 50,
                              child: Center(
                                child: IconButton(
                                  icon: Icon(
                                    setItem.completed ? Icons.check_box : Icons.check_box_outline_blank,
                                    color: setItem.completed ? AppColors.primaryAmber : Colors.grey,
                                  ),
                                  onPressed: () {
                                    context.read<ActiveWorkoutBloc>().add(ToggleSetCompletedEvent(setIdx));
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
              // Bottom Next/Prev controls
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCardElevated : AppColors.lightCard,
                  border: Border(
                    top: BorderSide(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
                  ),
                ),
                child: Row(
                  children: [
                    if (state.currentExerciseIndex > 0)
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            context.read<ActiveWorkoutBloc>().add(PreviousExerciseEvent());
                          },
                          child: const Text('PREVIOUS'),
                        ),
                      ),
                    if (state.currentExerciseIndex > 0) const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryAmber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () {
                          if (state.currentExerciseIndex < workout.exercises.length - 1) {
                            context.read<ActiveWorkoutBloc>().add(NextExerciseEvent());
                          } else {
                            _showQuitConfirmation(context);
                          }
                        },
                        child: Text(
                          state.currentExerciseIndex < workout.exercises.length - 1
                              ? 'NEXT MOVEMENT'
                              : 'COMPLETE WORKOUT',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showQuitConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Complete Workout?'),
        content: const Text('Are you ready to record your session and sync performance data to Torvex Engine?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CONTINUE LOGGING'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryAmber, foregroundColor: Colors.black),
            onPressed: () {
              Navigator.pop(ctx);
              context.read<ActiveWorkoutBloc>().add(FinishWorkoutSessionEvent());
            },
            child: const Text('FINISH & SYNC'),
          ),
        ],
      ),
    );
  }
}
