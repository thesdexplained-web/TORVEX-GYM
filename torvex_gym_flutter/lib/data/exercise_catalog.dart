import '../models/exercise_model.dart';

final List<Exercise> exerciseCatalog = [
  const Exercise(
    id: 'ex_barbell_squat',
    name: 'Barbell Back Squat',
    category: 'Lower Body',
    targetMuscles: ['Quadriceps', 'Glutes', 'Core'],
    equipmentNeeded: 'Barbell, Squat Rack',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 80.0,
    defaultRestSeconds: 90,
    instructions: [
      'Rest barbell across your upper traps.',
      'Descend keeping chest proud and knees tracking outward.',
      'Drive aggressively through mid-foot back to lockout.'
    ],
    tips: 'Brace core tightly before un-racking.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop',
  ),
  const Exercise(
    id: 'ex_bench_press',
    name: 'Flat Barbell Bench Press',
    category: 'Upper Body',
    targetMuscles: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps'],
    equipmentNeeded: 'Barbell, Flat Bench',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 70.0,
    defaultRestSeconds: 90,
    instructions: [
      'Set eyes directly beneath the bar on the bench.',
      'Lower bar with elbows tucked at 45-60 degrees.',
      'Press upward with intent while retracting scapulae.'
    ],
    tips: 'Maintain continuous arch in upper back without lifting hips.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop',
  ),
  const Exercise(
    id: 'ex_deadlift',
    name: 'Conventional Deadlift',
    category: 'Full Body',
    targetMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae', 'Lats'],
    equipmentNeeded: 'Barbell, Olympic Plates',
    defaultSets: 3,
    defaultReps: 5,
    defaultWeightKg: 100.0,
    defaultRestSeconds: 120,
    instructions: [
      'Stand with midfoot under the barbell.',
      'Hinge hips back and grasp barbell outside knees.',
      'Pull slack out of bar and drive earth away through heels.'
    ],
    tips: 'Lock hips and knees simultaneously at peak lockout.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop',
  ),
  const Exercise(
    id: 'ex_pullup',
    name: 'Weighted Pull-Up',
    category: 'Upper Body',
    targetMuscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'],
    equipmentNeeded: 'Pull-up Bar',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0.0,
    defaultRestSeconds: 60,
    instructions: [
      'Grip bar slightly wider than shoulder width.',
      'Engage lats and drive elbows downward toward hips.',
      'Clear chin fully above the bar and lower with control.'
    ],
    tips: 'Avoid kipping or swinging legs to maximize lat recruitment.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop',
  ),
  const Exercise(
    id: 'ex_plank',
    name: 'Forearm Core Plank',
    category: 'Core',
    targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Glutes'],
    equipmentNeeded: 'Exercise Mat',
    defaultSets: 3,
    defaultReps: 60,
    defaultWeightKg: 0.0,
    defaultRestSeconds: 45,
    instructions: [
      'Place forearms on floor with elbows directly under shoulders.',
      'Extend legs straight back into a rigid hollow-body plank.',
      'Squeeze glutes and draw belly button to spine.'
    ],
    tips: 'Do not let your lower back sag downward.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop',
  ),
];
