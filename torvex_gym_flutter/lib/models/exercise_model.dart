import 'package:equatable/equatable.dart';

class Exercise extends Equatable {
  final String id;
  final String name;
  final String category;
  final List<String> targetMuscles;
  final String equipmentNeeded;
  final int defaultSets;
  final int defaultReps;
  final double defaultWeightKg;
  final int defaultRestSeconds;
  final List<String> instructions;
  final String tips;
  final String imageUrl;

  const Exercise({
    required this.id,
    required this.name,
    required this.category,
    required this.targetMuscles,
    required this.equipmentNeeded,
    required this.defaultSets,
    required this.defaultReps,
    required this.defaultWeightKg,
    required this.defaultRestSeconds,
    required this.instructions,
    required this.tips,
    required this.imageUrl,
  });

  factory Exercise.fromMap(Map<String, dynamic> map) {
    return Exercise(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      category: map['category'] ?? 'Full Body',
      targetMuscles: List<String>.from(map['targetMuscles'] ?? []),
      equipmentNeeded: map['equipmentNeeded'] ?? 'Bodyweight',
      defaultSets: map['defaultSets']?.toInt() ?? 3,
      defaultReps: map['defaultReps']?.toInt() ?? 10,
      defaultWeightKg: (map['defaultWeightKg'] ?? 0).toDouble(),
      defaultRestSeconds: map['defaultRestSeconds']?.toInt() ?? 60,
      instructions: List<String>.from(map['instructions'] ?? []),
      tips: map['tips'] ?? '',
      imageUrl: map['imageUrl'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'targetMuscles': targetMuscles,
      'equipmentNeeded': equipmentNeeded,
      'defaultSets': defaultSets,
      'defaultReps': defaultReps,
      'defaultWeightKg': defaultWeightKg,
      'defaultRestSeconds': defaultRestSeconds,
      'instructions': instructions,
      'tips': tips,
      'imageUrl': imageUrl,
    };
  }

  @override
  List<Object?> get props => [id, name, category, defaultSets, defaultReps, defaultWeightKg];
}
