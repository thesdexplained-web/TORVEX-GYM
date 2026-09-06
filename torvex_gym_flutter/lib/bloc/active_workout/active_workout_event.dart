import 'package:equatable/equatable.dart';
import '../../models/workout_model.dart';

abstract class ActiveWorkoutEvent extends Equatable {
  const ActiveWorkoutEvent();
  @override
  List<Object?> get props => [];
}

class StartActiveWorkoutEvent extends ActiveWorkoutEvent {
  final Workout workout;
  const StartActiveWorkoutEvent(this.workout);
  @override
  List<Object?> get props => [workout];
}

class NextExerciseEvent extends ActiveWorkoutEvent {}

class PreviousExerciseEvent extends ActiveWorkoutEvent {}

class ToggleSetCompletedEvent extends ActiveWorkoutEvent {
  final int setIndex;
  const ToggleSetCompletedEvent(this.setIndex);
  @override
  List<Object?> get props => [setIndex];
}

class UpdateSetValuesEvent extends ActiveWorkoutEvent {
  final int setIndex;
  final int reps;
  final double weightKg;
  const UpdateSetValuesEvent(this.setIndex, this.reps, this.weightKg);
  @override
  List<Object?> get props => [setIndex, reps, weightKg];
}

class StartRestTimerEvent extends ActiveWorkoutEvent {
  final int seconds;
  const StartRestTimerEvent(this.seconds);
  @override
  List<Object?> get props => [seconds];
}

class TickWorkoutTimerEvent extends ActiveWorkoutEvent {}

class FinishWorkoutSessionEvent extends ActiveWorkoutEvent {}
