import 'package:equatable/equatable.dart';
import '../../models/workout_model.dart';
import '../../models/exercise_model.dart';

enum WorkoutStatus { initial, loading, loaded, error }

class WorkoutState extends Equatable {
  final WorkoutStatus status;
  final List<Workout> allWorkouts;
  final List<Workout> filteredWorkouts;
  final List<Exercise> exerciseLibrary;
  final List<String> favoriteIds;
  final String selectedCategory;
  final String selectedDifficulty;
  final bool onlyFavorites;
  final String searchQuery;
  final String? errorMessage;

  const WorkoutState({
    this.status = WorkoutStatus.initial,
    this.allWorkouts = const [],
    this.filteredWorkouts = const [],
    this.exerciseLibrary = const [],
    this.favoriteIds = const [],
    this.selectedCategory = 'All',
    this.selectedDifficulty = 'All',
    this.onlyFavorites = false,
    this.searchQuery = '',
    this.errorMessage,
  });

  WorkoutState copyWith({
    WorkoutStatus? status,
    List<Workout>? allWorkouts,
    List<Workout>? filteredWorkouts,
    List<Exercise>? exerciseLibrary,
    List<String>? favoriteIds,
    String? selectedCategory,
    String? selectedDifficulty,
    bool? onlyFavorites,
    String? searchQuery,
    String? errorMessage,
  }) {
    return WorkoutState(
      status: status ?? this.status,
      allWorkouts: allWorkouts ?? this.allWorkouts,
      filteredWorkouts: filteredWorkouts ?? this.filteredWorkouts,
      exerciseLibrary: exerciseLibrary ?? this.exerciseLibrary,
      favoriteIds: favoriteIds ?? this.favoriteIds,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedDifficulty: selectedDifficulty ?? this.selectedDifficulty,
      onlyFavorites: onlyFavorites ?? this.onlyFavorites,
      searchQuery: searchQuery ?? this.searchQuery,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        allWorkouts,
        filteredWorkouts,
        exerciseLibrary,
        favoriteIds,
        selectedCategory,
        selectedDifficulty,
        onlyFavorites,
        searchQuery,
        errorMessage,
      ];
}
