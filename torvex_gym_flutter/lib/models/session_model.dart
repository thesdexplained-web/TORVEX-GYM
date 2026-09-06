import 'package:equatable/equatable.dart';

class SetLog extends Equatable {
  final int setNumber;
  final int reps;
  final double weightKg;
  final bool completed;

  const SetLog({
    required this.setNumber,
    required this.reps,
    required this.weightKg,
    this.completed = false,
  });

  SetLog copyWith({int? setNumber, int? reps, double? weightKg, bool? completed}) {
    return SetLog(
      setNumber: setNumber ?? this.setNumber,
      reps: reps ?? this.reps,
      weightKg: weightKg ?? this.weightKg,
      completed: completed ?? this.completed,
    );
  }

  Map<String, dynamic> toMap() => {
    'setNumber': setNumber,
    'reps': reps,
    'weightKg': weightKg,
    'completed': completed,
  };

  factory SetLog.fromMap(Map<String, dynamic> map) => SetLog(
    setNumber: map['setNumber']?.toInt() ?? 1,
    reps: map['reps']?.toInt() ?? 10,
    weightKg: (map['weightKg'] ?? 0).toDouble(),
    completed: map['completed'] ?? false,
  );

  @override
  List<Object?> get props => [setNumber, reps, weightKg, completed];
}

class WorkoutSessionModel extends Equatable {
  final String sessionId;
  final String userId;
  final String workoutId;
  final String workoutTitle;
  final String category;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int durationSeconds;
  final int caloriesBurned;
  final String completionStatus; // 'completed', 'in_progress', 'abandoned'
  final List<Map<String, dynamic>> exerciseLogs;

  const WorkoutSessionModel({
    required this.sessionId,
    required this.userId,
    required this.workoutId,
    required this.workoutTitle,
    required this.category,
    required this.startedAt,
    this.completedAt,
    required this.durationSeconds,
    required this.caloriesBurned,
    this.completionStatus = 'in_progress',
    required this.exerciseLogs,
  });

  Map<String, dynamic> toMap() => {
    'sessionId': sessionId,
    'userId': userId,
    'workoutId': workoutId,
    'workoutTitle': workoutTitle,
    'category': category,
    'startedAt': startedAt.toIso8601String(),
    'completedAt': completedAt?.toIso8601String(),
    'durationSeconds': durationSeconds,
    'caloriesBurned': caloriesBurned,
    'completionStatus': completionStatus,
    'exerciseLogs': exerciseLogs,
  };

  factory WorkoutSessionModel.fromMap(Map<String, dynamic> map) => WorkoutSessionModel(
    sessionId: map['sessionId'] ?? '',
    userId: map['userId'] ?? '',
    workoutId: map['workoutId'] ?? '',
    workoutTitle: map['workoutTitle'] ?? '',
    category: map['category'] ?? 'Full Body',
    startedAt: DateTime.tryParse(map['startedAt'] ?? '') ?? DateTime.now(),
    completedAt: map['completedAt'] != null ? DateTime.tryParse(map['completedAt']) : null,
    durationSeconds: map['durationSeconds']?.toInt() ?? 0,
    caloriesBurned: map['caloriesBurned']?.toInt() ?? 0,
    completionStatus: map['completionStatus'] ?? 'in_progress',
    exerciseLogs: List<Map<String, dynamic>>.from(map['exerciseLogs'] ?? []),
  );

  @override
  List<Object?> get props => [sessionId, workoutId, durationSeconds, completionStatus];
}
