import { Workout, WorkoutCategory, Achievement, DailyChallenge, SubscriptionProduct } from '../types';

export const WORKOUT_CATEGORIES: { id: WorkoutCategory; name: string; description: string; icon: string }[] = [
  { id: 'Full Body', name: 'Full Body', description: 'Total kinetic chain engagement and metabolic conditioning', icon: 'Flame' },
  { id: 'Upper Body', name: 'Upper Body', description: 'Chest, shoulders, lats, biceps, and triceps hypertrophy', icon: 'Dumbbell' },
  { id: 'Lower Body', name: 'Lower Body', description: 'Quads, hamstrings, glutes, and calf power building', icon: 'Footprints' },
  { id: 'Strength', name: 'Strength', description: 'Heavy compound barbell & dumbbell overload protocols', icon: 'ShieldCheck' },
  { id: 'Cardio', name: 'Cardio', description: 'High intensity interval training and aerobic threshold', icon: 'HeartPulse' },
  { id: 'Yoga', name: 'Yoga', description: 'Mindful dynamic flows, balance postures, and deep breathing', icon: 'Activity' },
  { id: 'Core', name: 'Core', description: 'Anti-rotation, rotational torque, and isometric stability', icon: 'Target' },
  { id: 'Mobility', name: 'Mobility', description: 'Joint decompression, fascia release, and active range', icon: 'Sparkles' },
];

export const INITIAL_WORKOUTS: Workout[] = [
  {
    workoutId: 'torvex-fb-apex',
    title: 'Apex Total Body Hypertrophy',
    description: 'High-density multi-joint compound workout designed to trigger peak myofibrillar hypertrophy and explosive athletic strength.',
    category: 'Full Body',
    difficulty: 'Intermediate',
    durationMinutes: 45,
    targetMuscles: ['Chest', 'Quads', 'Upper Back', 'Shoulders', 'Core'],
    exerciseCount: 5,
    estimatedCalories: 420,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-barbell-squat',
        exerciseName: 'Barbell Back Squat',
        targetMuscles: ['Quads', 'Glutes', 'Core'],
        sets: 4,
        reps: 8,
        weightKg: 80,
        restSeconds: 90,
        instructions: [
          'Position bar across upper trapezius, feet shoulder-width apart.',
          'Hinge hips back and descend smoothly until thighs break parallel.',
          'Drive explosively upward through mid-foot, maintaining a braced neutral spine.'
        ],
      },
      {
        exerciseId: 'ex-incline-bench-press',
        exerciseName: 'Incline Dumbbell Press',
        targetMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
        sets: 4,
        reps: 10,
        weightKg: 28,
        restSeconds: 75,
        instructions: [
          'Set bench to 30 degrees. Retract and depress scapulae firmly against pad.',
          'Lower dumbbells under control with elbows tucked at 45 degrees.',
          'Press vertically without clanking weights, squeezing pectorals at peak contraction.'
        ],
      },
      {
        exerciseId: 'ex-barbell-row',
        exerciseName: 'Bent-Over Barbell Row',
        targetMuscles: ['Lats', 'Rhomboids', 'Rear Delts'],
        sets: 4,
        reps: 10,
        weightKg: 65,
        restSeconds: 75,
        instructions: [
          'Hinge torso to approximately 45 degrees with knees slightly flexed.',
          'Pull barbell toward lower sternum leading with elbows.',
          'Hold 1 second squeeze at top, then lower with a controlled 3-second negative.'
        ],
      },
      {
        exerciseId: 'ex-romanian-deadlift',
        exerciseName: 'Romanian Deadlift',
        targetMuscles: ['Hamstrings', 'Glutes', 'Spinal Erectors'],
        sets: 3,
        reps: 10,
        weightKg: 75,
        restSeconds: 90,
        instructions: [
          'Hold bar with overhand grip at hip level with chest proud.',
          'Push hips back horizontally while sliding barbell down along thighs.',
          'Feel deep stretch in hamstrings before snapping hips forward to lock out.'
        ],
      },
      {
        exerciseId: 'ex-hanging-leg-raise',
        exerciseName: 'Hanging Leg Raise',
        targetMuscles: ['Lower Abs', 'Hip Flexors', 'Grip'],
        sets: 3,
        reps: 12,
        weightKg: 0,
        restSeconds: 60,
        instructions: [
          'Hang from pull-up bar with active engaged shoulders.',
          'Raise legs under strict muscular control without swinging or relying on momentum.',
          'Bring ankles to hip height or higher, pause, and lower smoothly.'
        ],
      }
    ]
  },
  {
    workoutId: 'torvex-upper-titan',
    title: 'Titan Upper Body Overload',
    description: 'Specialized upper torso engineering targeting wide lats, full chest density, cannonball delts, and arm vascularity.',
    category: 'Upper Body',
    difficulty: 'Advanced',
    durationMinutes: 50,
    targetMuscles: ['Pectorals', 'Lats', 'Deltoids', 'Triceps', 'Biceps'],
    exerciseCount: 5,
    estimatedCalories: 480,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-flat-bench-press',
        exerciseName: 'Flat Barbell Bench Press',
        targetMuscles: ['Chest', 'Triceps', 'Anterior Deltoid'],
        sets: 4,
        reps: 6,
        weightKg: 90,
        restSeconds: 120,
        instructions: [
          'Plant feet firmly into floor with tight arched lumbar position.',
          'Lower bar with 3-second tempo touching lower sternum gently.',
          'Drive bar upward explosively along slight J-curve bar path.'
        ],
      },
      {
        exerciseId: 'ex-weighted-pullups',
        exerciseName: 'Weighted Neutral Pull-Ups',
        targetMuscles: ['Lats', 'Biceps', 'Mid Back'],
        sets: 4,
        reps: 8,
        weightKg: 10,
        restSeconds: 90,
        instructions: [
          'Use neutral parallel grip handles.',
          'Pull chest up to handle level driving elbows straight down to ribs.',
          'Lower to full dead-hang stretch under active tension.'
        ],
      },
      {
        exerciseId: 'ex-overhead-press',
        exerciseName: 'Standing Overhead Barbell Press',
        targetMuscles: ['Shoulders', 'Upper Chest', 'Triceps', 'Core'],
        sets: 3,
        reps: 8,
        weightKg: 50,
        restSeconds: 90,
        instructions: [
          'Squeeze glutes and brace core tightly.',
          'Press bar in a straight vertical path clearing chin and head.',
          'Push head through window at top with locked elbows.'
        ],
      },
      {
        exerciseId: 'ex-cable-chest-fly',
        exerciseName: 'Cable Mid-Chest Flyes',
        targetMuscles: ['Inner Chest', 'Anterior Deltoids'],
        sets: 3,
        reps: 12,
        weightKg: 16,
        restSeconds: 60,
        instructions: [
          'Set pulleys at shoulder height with slight forward lean.',
          'Bring handles together in a hugging motion keeping elbows slightly soft.',
          'Squeeze pecs for 2 seconds at midpoint before slow negative return.'
        ],
      },
      {
        exerciseId: 'ex-ez-bar-skullcrusher',
        exerciseName: 'EZ-Bar Skullcrushers',
        targetMuscles: ['Triceps Long & Lateral Head'],
        sets: 3,
        reps: 12,
        weightKg: 30,
        restSeconds: 60,
        instructions: [
          'Lie on flat bench, press bar directly over forehead.',
          'Bend elbows keeping upper arms angled slightly back toward crown.',
          'Extend back to starting position squeezing triceps.'
        ],
      }
    ]
  },
  {
    workoutId: 'torvex-lower-iron',
    title: 'Iron Foundation Lower Split',
    description: 'Relentless quad development, posterior chain fortification, and unilateral knee stability conditioning.',
    category: 'Lower Body',
    difficulty: 'Advanced',
    durationMinutes: 50,
    targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    exerciseCount: 5,
    estimatedCalories: 510,
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: true,
    exercises: [
      {
        exerciseId: 'ex-front-squat',
        exerciseName: 'Barbell Front Squat',
        targetMuscles: ['Quads', 'Core', 'Thoracic Spine'],
        sets: 4,
        reps: 8,
        weightKg: 70,
        restSeconds: 100,
        instructions: [
          'Rest bar across anterior deltoids with clean or cross-arm rack grip.',
          'Keep elbows pointed high throughout the descent.',
          'Hit full depth and push out of hole maintaining upright torso.'
        ],
      },
      {
        exerciseId: 'ex-bulgarian-split-squat',
        exerciseName: 'Dumbbell Bulgarian Split Squat',
        targetMuscles: ['Quads', 'Glutes', 'Adductors'],
        sets: 3,
        reps: 10,
        weightKg: 20,
        restSeconds: 75,
        instructions: [
          'Place rear instep onto a sturdy bench.',
          'Descend vertically until front thigh is parallel and rear knee taps ground.',
          'Drive through front heel to return to top.'
        ],
      },
      {
        exerciseId: 'ex-hamstring-curl',
        exerciseName: 'Lying Hamstring Leg Curl',
        targetMuscles: ['Hamstrings'],
        sets: 4,
        reps: 12,
        weightKg: 45,
        restSeconds: 60,
        instructions: [
          'Align knee joints with machine pivot axis.',
          'Curl heels smoothly toward glutes without lifting hips off pad.',
          'Control weight stack down on 3-second cadence.'
        ],
      },
      {
        exerciseId: 'ex-leg-press-heavy',
        exerciseName: '45-Degree Leg Press',
        targetMuscles: ['Quads', 'Glutes'],
        sets: 4,
        reps: 12,
        weightKg: 180,
        restSeconds: 90,
        instructions: [
          'Place feet middle-high on sled platform.',
          'Lower weight smoothly without letting pelvis tuck or round.',
          'Press sled up stopping just shy of mechanical knee lockout.'
        ],
      },
      {
        exerciseId: 'ex-standing-calf-raise',
        exerciseName: 'Standing Machine Calf Raise',
        targetMuscles: ['Gastrocnemius', 'Soleus'],
        sets: 4,
        reps: 15,
        weightKg: 70,
        restSeconds: 45,
        instructions: [
          'Balls of feet on edge of platform, drop heels for deep 2-second stretch.',
          'Elevate as high as possible on toes and squeeze calves for full second.'
        ],
      }
    ]
  },
  {
    workoutId: 'torvex-hiit-burn',
    title: 'Kinetic HIIT & Aerobic Engine',
    description: 'High-octane interval conditioning engineered to maximize VO2 max, EPOC metabolic afterburn, and mental resilience.',
    category: 'Cardio',
    difficulty: 'Beginner',
    durationMinutes: 30,
    targetMuscles: ['Cardiovascular System', 'Full Body', 'Core'],
    exerciseCount: 4,
    estimatedCalories: 350,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-kettlebell-swings',
        exerciseName: 'Hardstyle Kettlebell Swings',
        targetMuscles: ['Glutes', 'Hamstrings', 'Core', 'Lats'],
        sets: 4,
        reps: 20,
        weightKg: 20,
        restSeconds: 45,
        instructions: [
          'Hinge aggressively at hips and hike kettlebell back between upper thighs.',
          'Snap hips forward explosively standing tall like a plank.',
          'Let bell float to chest height before following it back into hinge.'
        ],
      },
      {
        exerciseId: 'ex-battle-ropes',
        exerciseName: 'Alternating Battle Ropes',
        targetMuscles: ['Shoulders', 'Arms', 'Core'],
        sets: 4,
        reps: 30,
        weightKg: 0,
        restSeconds: 45,
        instructions: [
          'Quarter squat stance with athletic chest posture.',
          'Create rapid alternating vertical waves with hands moving continuously.'
        ],
      },
      {
        exerciseId: 'ex-burpees-athletic',
        exerciseName: 'Athletic Chest-to-Floor Burpees',
        targetMuscles: ['Full Body', 'Cardio'],
        sets: 3,
        reps: 15,
        weightKg: 0,
        restSeconds: 60,
        instructions: [
          'Drop hands to floor, kick feet back to pushup plank.',
          'Lower chest to touch deck, push up and hop feet toward hands.',
          'Explode vertically with hands overhead.'
        ],
      },
      {
        exerciseId: 'ex-box-jumps',
        exerciseName: 'Plyometric Box Jumps',
        targetMuscles: ['Quads', 'Calves', 'Glutes'],
        sets: 3,
        reps: 10,
        weightKg: 0,
        restSeconds: 60,
        instructions: [
          'Stand 1 foot from 24-inch plyo box.',
          'Swing arms back and jump smoothly onto center of box.',
          'Land softly with bent knees, stand tall, and step down carefully.'
        ],
      }
    ]
  },
  {
    workoutId: 'torvex-core-bulletproof',
    title: 'Bulletproof Core & Anti-Flexion',
    description: 'Direct isometric bracing, abdominal hypertrophy, and rotational stability to safeguard your spine under heavy loads.',
    category: 'Core',
    difficulty: 'Beginner',
    durationMinutes: 25,
    targetMuscles: ['Rectus Abdominis', 'Obliques', 'Transverse Abdominis'],
    exerciseCount: 4,
    estimatedCalories: 210,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-ab-wheel-rollout',
        exerciseName: 'Ab Wheel Rollouts',
        targetMuscles: ['Upper & Lower Abs', 'Lats'],
        sets: 3,
        reps: 10,
        weightKg: 0,
        restSeconds: 60,
        instructions: [
          'Kneel on mat with wheel directly beneath shoulders.',
          'Tuck pelvis and roll wheel forward extending torso as far as tolerable.',
          'Pull wheel back using solely abdominals, avoiding hip sinking.'
        ],
      },
      {
        exerciseId: 'ex-pallof-press',
        exerciseName: 'Cable Pallof Press',
        targetMuscles: ['Anti-Rotation Core', 'Obliques'],
        sets: 3,
        reps: 12,
        weightKg: 12,
        restSeconds: 45,
        instructions: [
          'Stand perpendicular to cable tower holding handle at sternum.',
          'Press handle straight out resisting the rotational torque pulling you sideways.',
          'Hold 2 seconds with rock-solid posture, bring back to chest.'
        ],
      },
      {
        exerciseId: 'ex-weighted-plank',
        exerciseName: 'Weighted RKC Plank',
        targetMuscles: ['Deep Transverse Abdominis', 'Glutes'],
        sets: 3,
        reps: 45, // seconds
        weightKg: 15,
        restSeconds: 60,
        instructions: [
          'Forearms on mat, pull elbows toward toes while squeezing glutes.',
          'Create maximum internal muscular tension for 45 continuous seconds.'
        ],
      },
      {
        exerciseId: 'ex-russian-twists',
        exerciseName: 'Plate Russian Twists',
        targetMuscles: ['Obliques', 'Hip Flexors'],
        sets: 3,
        reps: 20,
        weightKg: 10,
        restSeconds: 45,
        instructions: [
          'Sit with knees bent, feet elevated slightly.',
          'Rotate weight plate side to side tapping gently outside each hip.'
        ],
      }
    ]
  },
  {
    workoutId: 'torvex-mobility-restore',
    title: 'Functional Mobility & Decompression',
    description: 'Active myofascial restoration, hip capsule opening, thoracic rotation, and joint longevity protocol.',
    category: 'Mobility',
    difficulty: 'Beginner',
    durationMinutes: 20,
    targetMuscles: ['Thoracic Spine', 'Hip Flexors', 'Hamstrings', 'Shoulders'],
    exerciseCount: 4,
    estimatedCalories: 130,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: true,
    exercises: [
      {
        exerciseId: 'ex-world-greatest-stretch',
        exerciseName: "World's Greatest Stretch",
        targetMuscles: ['Hip Flexors', 'Thoracic Spine', 'Hamstrings'],
        sets: 3,
        reps: 6,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Step into deep lunge with both hands on floor inside front foot.',
          'Drop inside elbow toward ankle, then rotate torso raising hand to ceiling.',
          'Rock hips back to stretch front hamstring.'
        ],
      },
      {
        exerciseId: 'ex-90-90-hip-flow',
        exerciseName: '90/90 Hip Mobility Transitions',
        targetMuscles: ['Hip Internal & External Rotators'],
        sets: 3,
        reps: 10,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Sit on floor with both legs bent at 90-degree angles.',
          'Fold torso over front shin, rise up, and swivel hips over to opposite side.'
        ],
      },
      {
        exerciseId: 'ex-thoracic-cat-cow',
        exerciseName: 'Thoracic Thread-the-Needle & Cat-Cow',
        targetMuscles: ['Thoracic Spine', 'Rhomboids'],
        sets: 3,
        reps: 8,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'From quadruped position, slide one arm underneath chest reaching far.',
          'Turn head to follow arm, feel deep shoulder blade decompression.'
        ],
      },
      {
        exerciseId: 'ex-deep-goblet-squat-hold',
        exerciseName: 'Deep Goblet Squat Isometric Prying',
        targetMuscles: ['Ankles', 'Hips', 'Groin'],
        sets: 3,
        reps: 45, // seconds
        weightKg: 8,
        restSeconds: 45,
        instructions: [
          'Hold light dumbbell at chest and sink into deepest possible squat.',
          'Use elbows to pry knees outward while breathing deeply into belly.'
        ],
      }
    ]
  },
  {
    workoutId: 'torvex-push-overload',
    title: 'Push Power: Chest, Delts & Triceps',
    description: 'Hyper-focused anterior chain development. Heavy pressing followed by targeted shoulder caps and triceps burnouts.',
    category: 'Upper Body',
    difficulty: 'Intermediate',
    durationMinutes: 45,
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    exerciseCount: 5,
    estimatedCalories: 430,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-incline-db-press',
        exerciseName: 'Incline Dumbbell Press (30°)',
        targetMuscles: ['Upper Chest', 'Triceps', 'Front Delts'],
        sets: 4,
        reps: 10,
        weightKg: 30,
        restSeconds: 75,
        instructions: ['Set bench to 30 degrees.', 'Lower dumbbells with 3s tempo.', 'Press in a converging arc.']
      },
      {
        exerciseId: 'ex-weighted-dips',
        exerciseName: 'Weighted Chest Dips',
        targetMuscles: ['Lower Chest', 'Triceps'],
        sets: 3,
        reps: 8,
        weightKg: 15,
        restSeconds: 90,
        instructions: ['Lean torso 30 degrees forward.', 'Descend to 90-degree elbow bend.', 'Press up locking triceps.']
      },
      {
        exerciseId: 'ex-db-lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        targetMuscles: ['Side Delts'],
        sets: 4,
        reps: 12,
        weightKg: 12,
        restSeconds: 45,
        instructions: ['Slight forward torso hinge.', 'Raise elbows out to shoulder height.', 'Control eccentric return.']
      },
      {
        exerciseId: 'ex-cable-chest-fly',
        exerciseName: 'Cable Mid-Chest Flyes',
        targetMuscles: ['Inner Chest'],
        sets: 3,
        reps: 12,
        weightKg: 16,
        restSeconds: 60,
        instructions: ['Step forward with pulleys at mid height.', 'Hug hands together.', 'Squeeze pecs for 1 second.']
      },
      {
        exerciseId: 'ex-rope-pushdown',
        exerciseName: 'Cable Triceps Rope Pushdown',
        targetMuscles: ['Triceps Lateral Head'],
        sets: 4,
        reps: 12,
        weightKg: 25,
        restSeconds: 45,
        instructions: ['Pin elbows to sides.', 'Extend arms straight down.', 'Spread rope at the bottom.']
      }
    ]
  },
  {
    workoutId: 'torvex-pull-density',
    title: 'Pull Dominance: Back, Traps & Biceps',
    description: 'V-taper construction. Heavy barbell rows, vertical lat pulls, rear delt isolation, and peak bicep recruitment.',
    category: 'Upper Body',
    difficulty: 'Advanced',
    durationMinutes: 50,
    targetMuscles: ['Lats', 'Rhomboids', 'Traps', 'Biceps'],
    exerciseCount: 5,
    estimatedCalories: 460,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: true,
    exercises: [
      {
        exerciseId: 'ex-barbell-bent-row',
        exerciseName: 'Barbell Bent-Over Row',
        targetMuscles: ['Lats', 'Mid Back', 'Biceps'],
        sets: 4,
        reps: 8,
        weightKg: 75,
        restSeconds: 90,
        instructions: ['45-degree hip hinge.', 'Pull bar to belly button.', 'Squeeze shoulder blades together.']
      },
      {
        exerciseId: 'ex-lat-pulldown',
        exerciseName: 'Wide-Grip Lat Pulldown',
        targetMuscles: ['Latissimus Dorsi'],
        sets: 4,
        reps: 10,
        weightKg: 65,
        restSeconds: 75,
        instructions: ['Lean back 10 degrees.', 'Pull bar to collarbone.', 'Control the 3-second stretch.']
      },
      {
        exerciseId: 'ex-seated-cable-row',
        exerciseName: 'Seated Cable Row (V-Grip)',
        targetMuscles: ['Rhomboids', 'Mid Back'],
        sets: 3,
        reps: 12,
        weightKg: 60,
        restSeconds: 60,
        instructions: ['Sit upright proud chest.', 'Pull handle into navel.', 'Pause 1s at contraction.']
      },
      {
        exerciseId: 'ex-face-pulls',
        exerciseName: 'Cable Face Pulls',
        targetMuscles: ['Rear Delts', 'Rotator Cuff'],
        sets: 4,
        reps: 15,
        weightKg: 20,
        restSeconds: 45,
        instructions: ['Pull rope toward eye level.', 'Rotate hands back with thumbs pointing behind.', 'Feel rear delts.']
      },
      {
        exerciseId: 'ex-barbell-curl',
        exerciseName: 'Standing Barbell Bicep Curl',
        targetMuscles: ['Biceps'],
        sets: 4,
        reps: 10,
        weightKg: 35,
        restSeconds: 60,
        instructions: ['Strict form with elbows pinned.', 'Curl smoothly to upper chest.', 'Lower under control.']
      }
    ]
  },
  {
    workoutId: 'torvex-barbell-5x5',
    title: 'Pure Compound Strength 5x5',
    description: 'Old-school strength building focused on progressive barbell overload across the foundational power lifts.',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationMinutes: 55,
    targetMuscles: ['Quads', 'Hamstrings', 'Chest', 'Back', 'Shoulders'],
    exerciseCount: 4,
    estimatedCalories: 520,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: true,
    exercises: [
      {
        exerciseId: 'ex-barbell-squat',
        exerciseName: 'Barbell Back Squat',
        targetMuscles: ['Quads', 'Glutes', 'Core'],
        sets: 5,
        reps: 5,
        weightKg: 110,
        restSeconds: 150,
        instructions: ['Bar across rear delts.', 'Squat deep breaking parallel.', 'Drive up through mid-foot.']
      },
      {
        exerciseId: 'ex-flat-bench-press',
        exerciseName: 'Flat Barbell Bench Press',
        targetMuscles: ['Chest', 'Triceps'],
        sets: 5,
        reps: 5,
        weightKg: 85,
        restSeconds: 120,
        instructions: ['Plant feet, retract scapulae.', 'Touch sternum with control.', 'Press up powerfully.']
      },
      {
        exerciseId: 'ex-barbell-bent-row',
        exerciseName: 'Barbell Pendlay Row',
        targetMuscles: ['Lats', 'Upper Back'],
        sets: 5,
        reps: 5,
        weightKg: 70,
        restSeconds: 120,
        instructions: ['Torso parallel to floor.', 'Explosively row from dead-stop off pins/floor.', 'Lower with control.']
      },
      {
        exerciseId: 'ex-overhead-barbell-press',
        exerciseName: 'Standing Overhead Barbell Press',
        targetMuscles: ['Shoulders', 'Triceps', 'Core'],
        sets: 5,
        reps: 5,
        weightKg: 55,
        restSeconds: 120,
        instructions: ['Brace core and glutes.', 'Press vertically clearing chin.', 'Lock out overhead with head through.']
      }
    ]
  },
  {
    workoutId: 'torvex-arms-forearms',
    title: 'Golden Era Arm & Forearm Hypertrophy',
    description: 'High-volume arm blaster combining maximum bicep stretch, triceps long-head overhead extension, and grip fatigue.',
    category: 'Upper Body',
    difficulty: 'Intermediate',
    durationMinutes: 40,
    targetMuscles: ['Biceps', 'Triceps', 'Brachialis', 'Forearms'],
    exerciseCount: 5,
    estimatedCalories: 360,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-incline-db-curl',
        exerciseName: 'Incline Dumbbell Hammer Curl',
        targetMuscles: ['Biceps Long Head', 'Brachioradialis'],
        sets: 4,
        reps: 12,
        weightKg: 14,
        restSeconds: 60,
        instructions: ['Sit on 45-degree incline.', 'Maintain hammer neutral grip.', 'Curl with full stretch at bottom.']
      },
      {
        exerciseId: 'ex-skull-crusher',
        exerciseName: 'EZ-Bar Lying Skullcrushers',
        targetMuscles: ['Triceps Long Head'],
        sets: 4,
        reps: 10,
        weightKg: 30,
        restSeconds: 60,
        instructions: ['Upper arms angled slightly back.', 'Hinge at elbows to lower bar to crown.', 'Extend fully.']
      },
      {
        exerciseId: 'ex-barbell-curl',
        exerciseName: 'Standing Barbell Bicep Curl',
        targetMuscles: ['Biceps'],
        sets: 3,
        reps: 10,
        weightKg: 35,
        restSeconds: 60,
        instructions: ['Strict form.', 'Pin elbows.', 'Squeeze for 1s at top.']
      },
      {
        exerciseId: 'ex-rope-pushdown',
        exerciseName: 'Cable Triceps Rope Pushdown',
        targetMuscles: ['Triceps'],
        sets: 4,
        reps: 15,
        weightKg: 20,
        restSeconds: 45,
        instructions: ['Tuck elbows.', 'Push down and spread rope apart.']
      },
      {
        exerciseId: 'ex-barbell-shrug',
        exerciseName: 'Heavy Barbell Farmer Holds & Shrugs',
        targetMuscles: ['Forearms', 'Grip', 'Traps'],
        sets: 3,
        reps: 15,
        weightKg: 80,
        restSeconds: 60,
        instructions: ['Hold bar at thighs.', 'Shrug straight up.', 'Hold isometric grip for 15s after last rep.']
      }
    ]
  },
  {
    workoutId: 'torvex-yoga-vinyasa',
    title: 'Vinyasa Flow & Dynamic Balance',
    description: 'Synchronize breath with movement through foundational sun salutations, standing warrior postures, and soothing restorative spinal stretches.',
    category: 'Yoga',
    difficulty: 'Zero Level',
    durationMinutes: 30,
    targetMuscles: ['Full Body', 'Hamstrings', 'Hips', 'Shoulders', 'Core'],
    exerciseCount: 5,
    estimatedCalories: 180,
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-yoga-sun-salutation',
        exerciseName: 'Sun Salutation Flow (Surya Namaskar)',
        targetMuscles: ['Full Body', 'Hamstrings', 'Chest'],
        sets: 3,
        reps: 5,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Inhale sweep arms upward to extended mountain pose.',
          'Exhale fold forward touching floor or shins.',
          'Step back to plank, lower through chaturanga, press up to upward-facing dog.',
          'Exhale press back to downward-facing dog and hold for 5 breaths.'
        ]
      },
      {
        exerciseId: 'ex-yoga-downward-dog',
        exerciseName: 'Downward-Facing Dog (Adho Mukha Svanasana)',
        targetMuscles: ['Hamstrings', 'Calves', 'Shoulders', 'Lats'],
        sets: 3,
        reps: 1,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Spread fingers wide on mat shoulder-width apart.',
          'Lift hips toward the ceiling forming an inverted V-shape.',
          'Press chest gently toward thighs while relaxing head and neck.'
        ]
      },
      {
        exerciseId: 'ex-yoga-warrior-two',
        exerciseName: 'Warrior II (Virabhadrasana II)',
        targetMuscles: ['Quads', 'Glutes', 'Hips', 'Shoulders'],
        sets: 3,
        reps: 2,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Step front foot forward, knee bent at 90 degrees directly over ankle.',
          'Keep back leg straight and outer edge of back foot pressed into mat.',
          'Extend arms parallel to floor, gazing over front middle finger.'
        ]
      },
      {
        exerciseId: 'ex-yoga-triangle-pose',
        exerciseName: 'Extended Triangle Pose (Utthita Trikonasana)',
        targetMuscles: ['Hamstrings', 'Obliques', 'Hips', 'Groin'],
        sets: 3,
        reps: 2,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Straighten both legs with feet wide apart.',
          'Hinge sideways at the hip reaching front hand down to shin or ankle.',
          'Reach opposite arm vertically toward ceiling opening chest.'
        ]
      },
      {
        exerciseId: 'ex-yoga-childs-pose',
        exerciseName: 'Balasana (Restorative Child’s Pose)',
        targetMuscles: ['Lower Back', 'Hips', 'Ankles', 'Shoulders'],
        sets: 2,
        reps: 1,
        weightKg: 0,
        restSeconds: 20,
        instructions: [
          'Kneel on mat with big toes touching and knees wide apart.',
          'Sink hips back onto heels and fold torso forward between thighs.',
          'Rest forehead on mat and extend arms long in front with relaxed deep breaths.'
        ]
      }
    ]
  },
  {
    workoutId: 'torvex-yoga-power',
    title: 'Power Ashtanga Yoga & Core Ignition',
    description: 'An athletic, heat-building vinyasa sequence blending balancing warrior series, core plank holds, and deep hip openers for mobility and strength.',
    category: 'Yoga',
    difficulty: 'Intermediate',
    durationMinutes: 40,
    targetMuscles: ['Core', 'Glutes', 'Upper Back', 'Shoulders', 'Adductors'],
    exerciseCount: 5,
    estimatedCalories: 260,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    isPremiumOnly: false,
    exercises: [
      {
        exerciseId: 'ex-yoga-warrior-three',
        exerciseName: 'Warrior III Dynamic Balance',
        targetMuscles: ['Hamstrings', 'Glutes', 'Core', 'Spinal Erectors'],
        sets: 3,
        reps: 6,
        weightKg: 0,
        restSeconds: 45,
        instructions: [
          'From standing, balance on one leg while hinging torso forward.',
          'Float the back leg straight back parallel to the ground.',
          'Reach arms forward forming a straight horizontal line from fingers to back heel.'
        ]
      },
      {
        exerciseId: 'ex-yoga-crow-pose',
        exerciseName: 'Bakasana (Crow Pose Progression)',
        targetMuscles: ['Forearms', 'Wrists', 'Deltoids', 'Core'],
        sets: 3,
        reps: 4,
        weightKg: 0,
        restSeconds: 45,
        instructions: [
          'Squat down and place palms flat on mat shoulder-width apart.',
          'Place knees onto the backs of your upper triceps.',
          'Lean forward shifting weight onto hands and lift toes off mat one at a time.'
        ]
      },
      {
        exerciseId: 'ex-yoga-pigeon-pose',
        exerciseName: 'Eka Pada Rajakapotasana (Pigeon Pose)',
        targetMuscles: ['Glutes', 'Piriformis', 'Psoas', 'Hip Flexors'],
        sets: 2,
        reps: 2,
        weightKg: 0,
        restSeconds: 40,
        instructions: [
          'Bring right knee forward behind right wrist, shin angled across mat.',
          'Slide left leg straight back with top of foot on mat.',
          'Keep hips square and lower torso over front shin.'
        ]
      },
      {
        exerciseId: 'ex-yoga-boat-pose',
        exerciseName: 'Navasana (Boat Pose Core Isometric)',
        targetMuscles: ['Rectus Abdominis', 'Hip Flexors', 'Lower Back'],
        sets: 3,
        reps: 30,
        weightKg: 0,
        restSeconds: 30,
        instructions: [
          'Sit with knees bent, lift feet off floor balancing on sit bones.',
          'Straighten legs to 45 degrees forming a V-shape with torso.',
          'Reach arms parallel to floor alongside shins and hold strong.'
        ]
      },
      {
        exerciseId: 'ex-yoga-bridge-wheel',
        exerciseName: 'Bridge to Wheel Heart Opener',
        targetMuscles: ['Glutes', 'Spinal Erectors', 'Chest', 'Quads'],
        sets: 3,
        reps: 8,
        weightKg: 0,
        restSeconds: 45,
        instructions: [
          'Lie on back with feet flat on floor hip-width apart.',
          'Drive through heels to lift pelvis high, squeezing glutes.',
          'Interlace fingers under back and press shoulders down into mat.'
        ]
      }
    ]
  }
];

export const INITIAL_ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    achievementId: 'ach-first-workout',
    name: 'First Workout',
    description: 'Complete your initial training session in TORVEX GYM.',
    category: 'Workouts',
    icon: 'Trophy',
    requirement: 1,
    unit: 'workout',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-first-step',
    name: 'First Step',
    description: 'Log your first 20 minutes of active workout time.',
    category: 'Milestones',
    icon: 'Footprints',
    requirement: 20,
    unit: 'minutes',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-streak-7',
    name: '7-Day Streak',
    description: 'Maintain your training streak for 7 consecutive days.',
    category: 'Streaks',
    icon: 'Flame',
    requirement: 7,
    unit: 'days',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-workouts-10',
    name: '10 Workouts',
    description: 'Reach 10 completed training sessions.',
    category: 'Workouts',
    icon: 'Dumbbell',
    requirement: 10,
    unit: 'workouts',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-streak-30',
    name: '30-Day Streak',
    description: 'Unstoppable consistency. Train 30 consecutive days.',
    category: 'Streaks',
    icon: 'Zap',
    requirement: 30,
    unit: 'days',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-workouts-100',
    name: '100 Workouts',
    description: 'Century Club member: complete 100 logged workouts.',
    category: 'Workouts',
    icon: 'Crown',
    requirement: 100,
    unit: 'workouts',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-cardio-crusher',
    name: 'Cardio Crusher',
    description: 'Burn a cumulative total of 3,000 calories.',
    category: 'Calories',
    icon: 'HeartPulse',
    requirement: 3000,
    unit: 'calories',
    progress: 0,
    isUnlocked: false
  },
  {
    achievementId: 'ach-strength-builder',
    name: 'Strength Builder',
    description: 'Complete 15 dedicated Strength or Hypertrophy sessions.',
    category: 'Milestones',
    icon: 'ShieldCheck',
    requirement: 15,
    unit: 'workouts',
    progress: 0,
    isUnlocked: false
  }
];

export const INITIAL_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    challengeId: 'dc-today-workout',
    title: 'Complete 1 Workout Today',
    description: 'Finish any workout session to keep momentum surging.',
    challengeDate: new Date().toISOString().split('T')[0],
    metric: 'workouts',
    targetValue: 1,
    currentValue: 0,
    completionStatus: 'pending',
    rewardPoints: 100
  },
  {
    challengeId: 'dc-today-time',
    title: 'Log 30 Active Minutes',
    description: 'Dedicate 30 minutes of high-intensity training.',
    challengeDate: new Date().toISOString().split('T')[0],
    metric: 'minutes',
    targetValue: 30,
    currentValue: 0,
    completionStatus: 'pending',
    rewardPoints: 150
  },
  {
    challengeId: 'dc-today-burn',
    title: 'Torch 350 Calories',
    description: 'Cross the 350 kcal expenditure threshold.',
    challengeDate: new Date().toISOString().split('T')[0],
    metric: 'calories',
    targetValue: 350,
    currentValue: 0,
    completionStatus: 'pending',
    rewardPoints: 200
  }
];

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    productId: 'torvex_sub_monthly',
    planType: 'monthly',
    title: 'Monthly Pass',
    priceDisplay: '₹249',
    priceValueInINR: 249,
    billingPeriodMonths: 1,
    effectiveMonthlyPriceDisplay: '₹249/mo',
    description: 'Full access billed monthly. Cancel anytime.'
  },
  {
    productId: 'torvex_sub_six_months',
    planType: 'six_months',
    title: '6-Month Pass',
    priceDisplay: '₹1,199',
    priceValueInINR: 1199,
    billingPeriodMonths: 6,
    badge: 'POPULAR',
    effectiveMonthlyPriceDisplay: '₹199/mo',
    description: 'Save 20% compared to monthly billing.'
  },
  {
    productId: 'torvex_sub_yearly',
    planType: 'yearly',
    title: 'Annual Pass',
    priceDisplay: '₹1,799',
    priceValueInINR: 1799,
    billingPeriodMonths: 12,
    badge: 'BEST VALUE',
    effectiveMonthlyPriceDisplay: '₹150/mo',
    description: 'Maximum savings. Full 12 months of unlimited Pro access.'
  }
];
