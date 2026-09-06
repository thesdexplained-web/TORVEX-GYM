import 'package:equatable/equatable.dart';
import '../../models/workout_model.dart';
import '../../models/session_model.dart';

enum ActiveWorkoutStatus { idle, running, restTimer, completed }

class ActiveWorkoutState extends Equatable {
  final ActiveWorkoutStatus status;
  final Workout? currentWorkout;
  final int currentExerciseIndex;
  final int elapsedSeconds;
  final int restRemainingSeconds;
  final int restTotalSeconds;
  final Map<int, List<SetLog>> exerciseSetLogs;
  final int burnedCalories;

  const ActiveWorkoutState({
    this.status = ActiveWorkoutStatus.idle,
    this.currentWorkout,
    this.currentExerciseIndex = 0,
    this.elapsedSeconds = 0,
    this.restRemainingSeconds = 0,
    this.restTotalSeconds = 60,
    this.exerciseSetLogs = const {},
    this.burnedCalories = 0,
  });

  WorkoutExerciseItem? get currentExercise {
    if (currentWorkout == null || currentWorkout!.exercises.isEmpty) return null;
    if (currentExerciseIndex >= currentWorkout!.exercises.length) return null;
    return currentWorkout!.exercises[currentExerciseIndex];
  }

  List<SetLog> get currentSets => exerciseSetLogs[currentExerciseIndex] ?? [];

  ActiveWorkoutState copyWith({
    ActiveWorkoutStatus? status,
    Workout? currentWorkout,
    int? currentExerciseIndex,
    int? elapsedSeconds,
    int? restRemainingSeconds,
    int? restTotalSeconds,
    Map<int, List<SetLog>>? exerciseSetLogs,
    int? burnedCalories,
  }) {
    return ActiveWorkoutState(
      status: status ?? this.status,
      currentWorkout: currentWorkout ?? this.currentWorkout,
      currentExerciseIndex: currentExerciseIndex ?? this.currentExerciseIndex,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      restRemainingSeconds: restRemainingSeconds ?? this.restRemainingSeconds,
      restTotalSeconds: restTotalSeconds ?? this.restTotalSeconds,
      exerciseSetLogs: exerciseSetLogs ?? this.exerciseSetLogs,
      burnedCalories: burnedCalories ?? this.burnedCalories,
    );
  }

  @override
  List<Object?> get props => [
        status,
        currentWorkout,
        currentExerciseIndex,
        elapsedSeconds,
        restRemainingSeconds,
        exerciseSetLogs,
        burnedCalories,
      ];
}
