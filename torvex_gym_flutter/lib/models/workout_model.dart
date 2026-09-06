import 'package:equatable/equatable.dart';

class WorkoutExerciseItem extends Equatable {
  final String exerciseId;
  final String exerciseName;
  final List<String> targetMuscles;
  final int sets;
  final int reps;
  final double weightKg;
  final int restSeconds;
  final List<String> instructions;
  final String imageUrl;

  const WorkoutExerciseItem({
    required this.exerciseId,
    required this.exerciseName,
    required this.targetMuscles,
    required this.sets,
    required this.reps,
    required this.weightKg,
    required this.restSeconds,
    required this.instructions,
    required this.imageUrl,
  });

  factory WorkoutExerciseItem.fromMap(Map<String, dynamic> map) {
    return WorkoutExerciseItem(
      exerciseId: map['exerciseId'] ?? '',
      exerciseName: map['exerciseName'] ?? '',
      targetMuscles: List<String>.from(map['targetMuscles'] ?? []),
      sets: map['sets']?.toInt() ?? 3,
      reps: map['reps']?.toInt() ?? 10,
      weightKg: (map['weightKg'] ?? 0).toDouble(),
      restSeconds: map['restSeconds']?.toInt() ?? 60,
      instructions: List<String>.from(map['instructions'] ?? []),
      imageUrl: map['imageUrl'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'exerciseId': exerciseId,
      'exerciseName': exerciseName,
      'targetMuscles': targetMuscles,
      'sets': sets,
      'reps': reps,
      'weightKg': weightKg,
      'restSeconds': restSeconds,
      'instructions': instructions,
      'imageUrl': imageUrl,
    };
  }

  @override
  List<Object?> get props => [exerciseId, exerciseName, sets, reps, weightKg, restSeconds];
}

class Workout extends Equatable {
  final String workoutId;
  final String title;
  final String description;
  final String category;
  final String difficulty;
  final int durationMinutes;
  final List<String> targetMuscles;
  final int exerciseCount;
  final List<WorkoutExerciseItem> exercises;
  final int estimatedCalories;
  final String imageUrl;
  final bool isPremiumOnly;

  const Workout({
    required this.workoutId,
    required this.title,
    required this.description,
    required this.category,
    required this.difficulty,
    required this.durationMinutes,
    required this.targetMuscles,
    required this.exerciseCount,
    required this.exercises,
    required this.estimatedCalories,
    required this.imageUrl,
    this.isPremiumOnly = false,
  });

  factory Workout.fromMap(Map<String, dynamic> map) {
    return Workout(
      workoutId: map['workoutId'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      category: map['category'] ?? 'Full Body',
      difficulty: map['difficulty'] ?? 'Intermediate',
      durationMinutes: map['durationMinutes']?.toInt() ?? 30,
      targetMuscles: List<String>.from(map['targetMuscles'] ?? []),
      exerciseCount: map['exerciseCount']?.toInt() ?? 0,
      exercises: (map['exercises'] as List<dynamic>? ?? [])
          .map((e) => WorkoutExerciseItem.fromMap(Map<String, dynamic>.from(e)))
          .toList(),
      estimatedCalories: map['estimatedCalories']?.toInt() ?? 250,
      imageUrl: map['imageUrl'] ?? '',
      isPremiumOnly: map['isPremiumOnly'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'workoutId': workoutId,
      'title': title,
      'description': description,
      'category': category,
      'difficulty': difficulty,
      'durationMinutes': durationMinutes,
      'targetMuscles': targetMuscles,
      'exerciseCount': exerciseCount,
      'exercises': exercises.map((e) => e.toMap()).toList(),
      'estimatedCalories': estimatedCalories,
      'imageUrl': imageUrl,
      'isPremiumOnly': isPremiumOnly,
    };
  }

  @override
  List<Object?> get props => [workoutId, title, category, difficulty, durationMinutes];
}
