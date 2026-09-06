import 'package:equatable/equatable.dart';

abstract class WorkoutEvent extends Equatable {
  const WorkoutEvent();
  @override
  List<Object?> get props => [];
}

class LoadWorkoutsEvent extends WorkoutEvent {}

class FilterWorkoutsEvent extends WorkoutEvent {
  final String category;
  final String difficulty;
  final bool onlyFavorites;
  final String searchQuery;

  const FilterWorkoutsEvent({
    this.category = 'All',
    this.difficulty = 'All',
    this.onlyFavorites = false,
    this.searchQuery = '',
  });

  @override
  List<Object?> get props => [category, difficulty, onlyFavorites, searchQuery];
}

class ToggleFavoriteWorkoutEvent extends WorkoutEvent {
  final String workoutId;
  const ToggleFavoriteWorkoutEvent(this.workoutId);

  @override
  List<Object?> get props => [workoutId];
}
