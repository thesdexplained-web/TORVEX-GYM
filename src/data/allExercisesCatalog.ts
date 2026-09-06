import { Exercise, Workout } from '../types';

export const COMPREHENSIVE_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'ex-flat-bench-press',
    name: 'Flat Barbell Bench Press',
    category: 'Upper Body',
    targetMuscles: ['Chest', 'Triceps', 'Anterior Deltoid'],
    equipmentNeeded: 'Barbell & Flat Bench',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 80,
    defaultRestSeconds: 90,
    instructions: [
      'Retract scapula into bench and plant feet firmly on the ground.',
      'Unrack bar directly over shoulders with wrists straight.',
      'Lower under control to touch sternum with 2-second eccentric cadence.',
      'Drive upwards through the palms, keeping glutes glued to the bench.'
    ],
    tips: 'Avoid flaring elbows at 90 degrees; tuck elbows at roughly 45-60 degrees to preserve rotator cuffs.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press',
    category: 'Upper Body',
    targetMuscles: ['Clavicular Head (Upper Chest)', 'Triceps', 'Front Delts'],
    equipmentNeeded: 'Incline Bench (30°) & Dumbbells',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 28,
    defaultRestSeconds: 75,
    instructions: [
      'Set bench to 30-45 degree incline.',
      'Kick dumbbells up into start position with locked core.',
      'Lower dumbbells until upper arms break parallel to floor.',
      'Press up in a converging arc without banging dumbbells together.'
    ],
    tips: 'A 30-degree incline prioritizes the upper pecs while minimizing front deltoid takeover.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-cable-chest-fly',
    name: 'Cable Mid-Chest Flyes',
    category: 'Upper Body',
    targetMuscles: ['Pectoralis Major (Sternal Head)', 'Anterior Deltoid'],
    equipmentNeeded: 'Dual Cable Tower',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 15,
    defaultRestSeconds: 60,
    instructions: [
      'Set pulleys at chest height, step forward into staggered stance.',
      'Keep slight bend in elbows and sweep hands together in wide hugging motion.',
      'Squeeze pecs hard at peak contraction for 1 second.'
    ],
    tips: 'Focus on bringing the inner creases of your elbows together rather than just touching your hands.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-weighted-dips',
    name: 'Weighted Chest Dips',
    category: 'Upper Body',
    targetMuscles: ['Lower Chest', 'Triceps', 'Anterior Delts'],
    equipmentNeeded: 'Parallel Dip Bars & Dip Belt',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeightKg: 10,
    defaultRestSeconds: 90,
    instructions: [
      'Mount dip bars and lean torso forward roughly 30 degrees.',
      'Descend until elbows reach 90-degree flexion feeling deep chest stretch.',
      'Press back up forcefully locking out triceps.'
    ],
    tips: 'Forward lean targets the chest, while an upright torso emphasizes triceps.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-pushups-strict',
    name: 'Strict Tempo Push-Ups',
    category: 'Upper Body',
    targetMuscles: ['Chest', 'Triceps', 'Core'],
    equipmentNeeded: 'Bodyweight',
    defaultSets: 3,
    defaultReps: 20,
    defaultWeightKg: 0,
    defaultRestSeconds: 45,
    instructions: [
      'Assume high plank with hands slightly wider than shoulder-width.',
      'Brace core and glutes like a steel beam.',
      'Lower chest until 1 inch from floor on a 3-second descent, then explode up.'
    ],
    tips: 'Never let hips sag; maintain rigid spinal neutrality throughout.',
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600&auto=format&fit=crop'
  },

  // BACK
  {
    id: 'ex-barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'Strength',
    targetMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae', 'Lats', 'Traps'],
    equipmentNeeded: 'Olympic Barbell & Bumper Plates',
    defaultSets: 4,
    defaultReps: 5,
    defaultWeightKg: 120,
    defaultRestSeconds: 150,
    instructions: [
      'Stance hip-width with bar cutting directly across mid-foot.',
      'Hinge hips back, grasp bar just outside shins, pull slack out of bar.',
      'Drive floor away through heels, extending hips and knees simultaneously.'
    ],
    tips: 'Think of pushing the earth down rather than yanking the barbell up.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-barbell-bent-row',
    name: 'Barbell Bent-Over Row',
    category: 'Upper Body',
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Rear Delts', 'Biceps'],
    equipmentNeeded: 'Olympic Barbell',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 70,
    defaultRestSeconds: 90,
    instructions: [
      'Hinge at hips at roughly 45 degrees with knees softly unlocked.',
      'Pull bar toward lower abdomen driving elbows back towards ceiling.',
      'Squeeze scapulae firmly together at top before lowering under control.'
    ],
    tips: 'Do not use torso momentum to bounce the weight up; keep lumbar spine locked.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    category: 'Upper Body',
    targetMuscles: ['Latissimus Dorsi', 'Teres Major', 'Biceps'],
    equipmentNeeded: 'Cable Pulldown Machine',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 65,
    defaultRestSeconds: 75,
    instructions: [
      'Grasp wide lat bar slightly outside shoulders.',
      'Lean back 10 degrees, initiate pull by depressing shoulder blades.',
      'Pull bar to collarbone driving elbows down and slightly inward.'
    ],
    tips: 'Avoid rocking wildly back and forth. Keep upper torso stationary.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Seated Cable Row (V-Grip)',
    category: 'Upper Body',
    targetMuscles: ['Mid-Back', 'Rhomboids', 'Lats', 'Biceps'],
    equipmentNeeded: 'Low Row Machine & V-Grip',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 60,
    defaultRestSeconds: 60,
    instructions: [
      'Sit tall with knees slightly bent and feet secured on footrests.',
      'Pull handle to navel while pulling shoulders back and puffing chest.',
      'Slowly allow handles forward feeling mid-back stretch.'
    ],
    tips: 'Pause for 1 full second with chest proud at peak contraction.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-face-pulls',
    name: 'Cable Face Pulls',
    category: 'Upper Body',
    targetMuscles: ['Rear Deltoids', 'Rotator Cuff', 'Upper Traps'],
    equipmentNeeded: 'Cable Machine & Rope Attachment',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 20,
    defaultRestSeconds: 45,
    instructions: [
      'Set pulley to eye height and grab rope with overhand thumbs-back grip.',
      'Pull rope towards face separating hands at temple level.',
      'Finish with external shoulder rotation thumbs pointing behind you.'
    ],
    tips: 'Crucial exercise for bulletproofing shoulders and reversing desk posture.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
  },

  // SHOULDERS
  {
    id: 'ex-overhead-barbell-press',
    name: 'Standing Overhead Barbell Press',
    category: 'Upper Body',
    targetMuscles: ['Anterior Deltoids', 'Triceps', 'Upper Chest', 'Core'],
    equipmentNeeded: 'Olympic Barbell & Squat Rack',
    defaultSets: 4,
    defaultReps: 6,
    defaultWeightKg: 50,
    defaultRestSeconds: 100,
    instructions: [
      'Rest bar on anterior deltoids with vertical forearms.',
      'Brace core and glutes, tilt head back slightly to clear chin.',
      'Press straight up, pushing head forward through window at top lockout.'
    ],
    tips: 'Do not hyperextend lumbar spine. Squeeze glutes hard to create a solid kinetic base.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-db-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'Upper Body',
    targetMuscles: ['Lateral Deltoids (Side Delts)'],
    equipmentNeeded: 'Dumbbells',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 12,
    defaultRestSeconds: 45,
    instructions: [
      'Stand with feet shoulder-width, dumbbells at hips, slight forward hinge.',
      'Lead with elbows raising arms out to sides until parallel to ground.',
      'Control the eccentric descent over 2-3 seconds.'
    ],
    tips: 'Pour the water: keep pinkies slightly higher than thumbs to isolate side delts.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Dumbbell Press',
    category: 'Upper Body',
    targetMuscles: ['All 3 Deltoid Heads', 'Triceps'],
    equipmentNeeded: 'Dumbbells & 90° Bench',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 18,
    defaultRestSeconds: 60,
    instructions: [
      'Hold dumbbells at chin height with palms facing your face.',
      'As you press upward, rotate wrists 180 degrees until palms face forward at top.',
      'Reverse rotation smoothly as you lower back to chin level.'
    ],
    tips: 'Keep movement fluid and continuous through the full rotational path.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-barbell-shrug',
    name: 'Barbell Trap Shrugs',
    category: 'Upper Body',
    targetMuscles: ['Upper Trapezius', 'Forearms'],
    equipmentNeeded: 'Olympic Barbell',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 90,
    defaultRestSeconds: 60,
    instructions: [
      'Hold barbell with double overhand grip resting on mid-thigh.',
      'Elevate shoulders straight up towards ears as high as possible.',
      'Pause for 1 second at peak contraction without rolling shoulders.'
    ],
    tips: 'Never roll shoulders backward under load; move vertically to avoid cervical spine strain.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },

  // ARMS
  {
    id: 'ex-barbell-curl',
    name: 'Standing Barbell Bicep Curl',
    category: 'Upper Body',
    targetMuscles: ['Biceps Brachii', 'Brachialis'],
    equipmentNeeded: 'Straight Barbell or EZ-Curl Bar',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 35,
    defaultRestSeconds: 60,
    instructions: [
      'Stand with feet shoulder-width, gripping bar with supinated palms.',
      'Keep elbows pinned tight against sides and curl bar to chest.',
      'Squeeze biceps hard at top before lowering on 3-second negative.'
    ],
    tips: 'Do not swing your lower back. If your torso rocks, reduce the weight.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-incline-db-curl',
    name: 'Incline Dumbbell Hammer Curl',
    category: 'Upper Body',
    targetMuscles: ['Biceps Long Head', 'Brachioradialis'],
    equipmentNeeded: 'Incline Bench (45°) & Dumbbells',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 14,
    defaultRestSeconds: 60,
    instructions: [
      'Lie back on 45-degree incline bench with arms hanging fully extended.',
      'Curl dumbbells simultaneously with neutral thumbs-up hammer grip.',
      'Lower slowly feeling deep long-head stretch at the bottom.'
    ],
    tips: 'Incline placement puts biceps in maximum passive stretch for superior hypertrophy.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-rope-pushdown',
    name: 'Cable Triceps Rope Pushdown',
    category: 'Upper Body',
    targetMuscles: ['Triceps Lateral & Medial Heads'],
    equipmentNeeded: 'High Cable Tower & Rope Attachment',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 25,
    defaultRestSeconds: 45,
    instructions: [
      'Stand with slight forward lean, elbows tucked into flanks.',
      'Push rope straight down extending elbows fully.',
      'Spread rope ends apart at bottom for peak contraction.'
    ],
    tips: 'Lock upper arms into position; only your forearms should move.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-skull-crusher',
    name: 'EZ-Bar Lying Skullcrushers',
    category: 'Upper Body',
    targetMuscles: ['Triceps Long Head'],
    equipmentNeeded: 'EZ-Bar & Flat Bench',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 30,
    defaultRestSeconds: 60,
    instructions: [
      'Lie on flat bench with EZ-bar held directly over forehead.',
      'Hinge at elbows lowering bar towards top of head or slightly behind bench.',
      'Extend forearms back to starting position squeezing triceps.'
    ],
    tips: 'Angling upper arms 10 degrees back maintains constant tension at top lockout.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
  },

  // LEGS
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    category: 'Lower Body',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    equipmentNeeded: 'Squat Rack & Olympic Barbell',
    defaultSets: 4,
    defaultReps: 6,
    defaultWeightKg: 100,
    defaultRestSeconds: 120,
    instructions: [
      'Rest bar securely on upper traps or rear delts with proud chest.',
      'Unrack, take 2 steps back, feet shoulder-width with toes flared 15 degrees.',
      'Break at hips and knees simultaneously, descending until hip crease breaks parallel.',
      'Drive powerfully through mid-foot to stand.'
    ],
    tips: 'Keep knees tracking directly in line with toes throughout entire ROM.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    category: 'Lower Body',
    targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipmentNeeded: 'Barbell',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 80,
    defaultRestSeconds: 90,
    instructions: [
      'Hold barbell with double overhand grip, stand tall with unlocked knees.',
      'Push hips back toward wall behind you while sliding bar down along shins.',
      'Stop when hamstrings are under maximum loaded stretch.',
      'Drive hips forward to return to standing lockout.'
    ],
    tips: 'Think of hips moving horizontally backward, not descending vertically.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-leg-press',
    name: '45-Degree Sled Leg Press',
    category: 'Lower Body',
    targetMuscles: ['Quadriceps', 'Glutes'],
    equipmentNeeded: '45° Leg Press Machine',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeightKg: 160,
    defaultRestSeconds: 90,
    instructions: [
      'Sit firmly in seat with lower back and pelvis flat against backrest.',
      'Place feet shoulder-width in middle of sled platform.',
      'Disengage safeties and lower sled until knees form 90-degree angle.',
      'Press sled up without completely locking out knees.'
    ],
    tips: 'Never let your tailbone or lower back lift off the pad.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Dumbbell Bulgarian Split Squat',
    category: 'Lower Body',
    targetMuscles: ['Quadriceps', 'Glutes', 'Adductors'],
    equipmentNeeded: 'Bench & Dumbbells',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 18,
    defaultRestSeconds: 75,
    instructions: [
      'Place top of rear foot on bench behind you.',
      'Lower torso vertically until front thigh is parallel to floor.',
      'Drive through front heel to return to top.'
    ],
    tips: 'Unilateral gold standard: balances strength asymmetries between left and right leg.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-hip-thrust',
    name: 'Barbell Glute Hip Thrust',
    category: 'Lower Body',
    targetMuscles: ['Gluteus Maximus', 'Hamstrings'],
    equipmentNeeded: 'Barbell, Foam Pad & Bench',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeightKg: 100,
    defaultRestSeconds: 90,
    instructions: [
      'Upper back supported against bench, barbell placed across hip crease with pad.',
      'Feet flat on ground shoulder-width apart.',
      'Drive hips straight upward toward ceiling, squeezing glutes hard at top.',
      'Hold peak squeeze for 1 second with posterior pelvic tilt.'
    ],
    tips: 'Keep chin tucked toward chest rather than leaning head back.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-standing-calf-raise',
    name: 'Standing Machine Calf Raise',
    category: 'Lower Body',
    targetMuscles: ['Gastrocnemius', 'Soleus'],
    equipmentNeeded: 'Standing Calf Machine',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeightKg: 70,
    defaultRestSeconds: 45,
    instructions: [
      'Balls of feet on platform, drop heels down into deep 2-second stretch.',
      'Drive up onto big toes and hold maximum contraction for 1 full second.'
    ],
    tips: 'Bouncing removes tension from the calf muscle into the Achilles tendon. Use strict pauses.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop'
  },

  // CORE
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Straight Leg Raise',
    category: 'Core',
    targetMuscles: ['Lower Abs (Rectus Abdominis)', 'Hip Flexors'],
    equipmentNeeded: 'Pull-Up Bar',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 0,
    defaultRestSeconds: 60,
    instructions: [
      'Hang from pull-up bar with overhand grip and engaged lats.',
      'Without swinging, raise legs straight up until toes touch bar or reach 90 degrees.',
      'Lower slowly over 3 seconds under strict abdominal control.'
    ],
    tips: 'Curl pelvis up at top of movement to fully engage abdominal wall.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-cable-woodchopper',
    name: 'Cable High-to-Low Woodchoppers',
    category: 'Core',
    targetMuscles: ['Internal & External Obliques', 'Transverse Abdominis'],
    equipmentNeeded: 'High Cable Tower & Handle',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 20,
    defaultRestSeconds: 45,
    instructions: [
      'Stand perpendicular to high cable with feet wider than shoulder-width.',
      'Pull handle diagonally across body down toward opposite knee.',
      'Pivot rear foot and rotate through core torso.'
    ],
    tips: 'Arms stay relatively extended; movement is driven by rotational torso torque.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-ab-wheel-rollout',
    name: 'Ab Wheel Rollouts',
    category: 'Core',
    targetMuscles: ['Rectus Abdominis', 'Lats', 'Core Anti-Extension'],
    equipmentNeeded: 'Ab Wheel Roller & Kneeling Mat',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    defaultRestSeconds: 60,
    instructions: [
      'Kneel on mat with wheel directly underneath shoulders.',
      'Round upper back slightly and roll wheel forward extending torso as far as tolerable.',
      'Pull wheel back toward knees using abdominals alone.'
    ],
    tips: 'Never let your lower back sag into hyperextension.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-weighted-plank',
    name: 'Weighted RKC Plank',
    category: 'Core',
    targetMuscles: ['Deep Transverse Abdominis', 'Glutes', 'Serratus Anterior'],
    equipmentNeeded: 'Weight Plate & Floor Mat',
    defaultSets: 3,
    defaultReps: 45,
    defaultWeightKg: 15,
    defaultRestSeconds: 60,
    instructions: [
      'Assume forearm plank position with weight plate resting securely on upper back.',
      'Pull elbows toward toes while aggressively flexing glutes and quads.',
      'Breathe deeply while maintaining maximum isometric whole-body tension.'
    ],
    tips: 'Active RKC bracing generates 3x more abdominal activation than passive planks.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop'
  },

  // CARDIO & HIIT
  {
    id: 'ex-kettlebell-swings',
    name: 'Hardstyle Kettlebell Swings',
    category: 'Cardio',
    targetMuscles: ['Glutes', 'Hamstrings', 'Cardiovascular System', 'Lats'],
    equipmentNeeded: 'Cast Iron Kettlebell (20kg+)',
    defaultSets: 4,
    defaultReps: 20,
    defaultWeightKg: 24,
    defaultRestSeconds: 45,
    instructions: [
      'Hinge at hips with soft knees, hike bell between upper thighs.',
      'Snap hips forward explosively standing tall like an upright plank.',
      'Float bell to chest level before letting gravity pull it back into hip hinge.'
    ],
    tips: 'This is a ballistic hip hinge, never a squat or front raise.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-assault-bike-sprints',
    name: 'Air Bike Max Effort Sprints',
    category: 'Cardio',
    targetMuscles: ['Full Body Conditioning', 'Anaerobic Threshold', 'Quads'],
    equipmentNeeded: 'Assault / Rogue Echo Bike',
    defaultSets: 5,
    defaultReps: 30, // seconds
    defaultWeightKg: 0,
    defaultRestSeconds: 60,
    instructions: [
      'Adjust seat height so slight knee bend exists at lowest pedal position.',
      'Push and pull handles with maximum aggression while pumping legs at 100% effort.'
    ],
    tips: 'Maintain steady rhythmic breathing during rest intervals to expedite lactate clearing.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-box-jumps',
    name: 'Plyometric Box Jumps',
    category: 'Cardio',
    targetMuscles: ['Fast-Twitch Muscle Fibers', 'Quads', 'Glutes'],
    equipmentNeeded: '24-30 inch Plyo Box',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeightKg: 0,
    defaultRestSeconds: 60,
    instructions: [
      'Stand 1 foot from box, load hips and swing arms backward.',
      'Explode upwards landing quietly with soft knees in center of box.',
      'Stand up to full extension, then step down one foot at a time.'
    ],
    tips: 'Step down rather than jumping down backwards to protect Achilles tendons.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },

  // MOBILITY
  {
    id: 'ex-world-greatest-stretch',
    name: "World's Greatest Stretch",
    category: 'Mobility',
    targetMuscles: ['Hip Flexors', 'Thoracic Spine', 'Hamstrings', 'Ankles'],
    equipmentNeeded: 'Floor Mat',
    defaultSets: 3,
    defaultReps: 6,
    defaultWeightKg: 0,
    defaultRestSeconds: 30,
    instructions: [
      'Step into deep forward lunge with hands on floor inside front foot.',
      'Drop inside elbow toward ankle for 2 seconds.',
      'Rotate torso upward pointing top hand straight to the ceiling.',
      'Shift hips back to straighten front leg and stretch hamstring.'
    ],
    tips: 'Flow smoothly through all three phases on both left and right sides.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ex-90-90-hip-flow',
    name: '90/90 Hip Mobility Transitions',
    category: 'Mobility',
    targetMuscles: ['Hip Internal & External Rotators', 'Gluteus Medius'],
    equipmentNeeded: 'Floor Mat',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    defaultRestSeconds: 30,
    instructions: [
      'Sit with both knees bent at 90-degree angles on floor.',
      'Hinge forward over front shin to stretch external rotators.',
      'Lift knees without using hands and windshield-wiper legs to opposite side.'
    ],
    tips: 'Keep spine upright and attempt to rotate hips with minimal torso swaying.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop'
  }
];
