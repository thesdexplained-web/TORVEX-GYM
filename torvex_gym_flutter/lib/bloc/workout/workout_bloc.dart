import 'package:flutter_bloc/flutter_bloc.dart';
import 'workout_event.dart';
import 'workout_state.dart';
import '../../data/initial_workouts.dart';
import '../../data/exercise_catalog.dart';
import '../../core/services/storage_service.dart';
import '../../models/workout_model.dart';

class WorkoutBloc extends Bloc<WorkoutEvent, WorkoutState> {
  WorkoutBloc() : super(const WorkoutState()) {
    on<LoadWorkoutsEvent>(_onLoadWorkouts);
    on<FilterWorkoutsEvent>(_onFilterWorkouts);
    on<ToggleFavoriteWorkoutEvent>(_onToggleFavorite);
  }

  Future<void> _onLoadWorkouts(LoadWorkoutsEvent event, Emitter<WorkoutState> emit) async {
    emit(state.copyWith(status: WorkoutStatus.loading));
    try {
      final favoriteIds = StorageService.getFavoriteIds();
      final all = initialWorkouts;
      final exercises = exerciseCatalog;

      emit(state.copyWith(
        status: WorkoutStatus.loaded,
        allWorkouts: all,
        filteredWorkouts: all,
        exerciseLibrary: exercises,
        favoriteIds: favoriteIds,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: WorkoutStatus.error,
        errorMessage: 'Failed to load workouts: $e',
      ));
    }
  }

  void _onFilterWorkouts(FilterWorkoutsEvent event, Emitter<WorkoutState> emit) {
    List<Workout> filtered = List.from(state.allWorkouts);

    // 1. Category
    if (event.category != 'All') {
      filtered = filtered.where((w) => w.category == event.category).toList();
    }

    // 2. Difficulty
    if (event.difficulty != 'All') {
      filtered = filtered.where((w) => w.difficulty.toLowerCase() == event.difficulty.toLowerCase()).toList();
    }

    // 3. Favorites
    if (event.onlyFavorites) {
      filtered = filtered.where((w) => state.favoriteIds.contains(w.workoutId)).toList();
    }

    // 4. Search query
    if (event.searchQuery.trim().isNotEmpty) {
      final q = event.searchQuery.toLowerCase();
      filtered = filtered.where((w) =>
          w.title.toLowerCase().contains(q) ||
          w.description.toLowerCase().contains(q) ||
          w.targetMuscles.any((m) => m.toLowerCase().contains(q))).toList();
    }

    emit(state.copyWith(
      filteredWorkouts: filtered,
      selectedCategory: event.category,
      selectedDifficulty: event.difficulty,
      onlyFavorites: event.onlyFavorites,
      searchQuery: event.searchQuery,
    ));
  }

  Future<void> _onToggleFavorite(ToggleFavoriteWorkoutEvent event, Emitter<WorkoutState> emit) async {
    final updated = List<String>.from(state.favoriteIds);
    if (updated.contains(event.workoutId)) {
      updated.remove(event.workoutId);
    } else {
      updated.add(event.workoutId);
    }
    await StorageService.saveFavoriteIds(updated);

    emit(state.copyWith(favoriteIds: updated));
    // Re-apply current filters
    add(FilterWorkoutsEvent(
      category: state.selectedCategory,
      difficulty: state.selectedDifficulty,
      onlyFavorites: state.onlyFavorites,
      searchQuery: state.searchQuery,
    ));
  }
}
