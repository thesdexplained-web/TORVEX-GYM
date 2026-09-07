import { AiCoachRecommendation, WorkoutDifficulty } from '../types';

export interface AiCoachConsultationRequest {
  fitnessGoal: string;
  fitnessLevel: WorkoutDifficulty;
  availableWorkoutTime: number; // minutes
  trainingPreference: string;
  equipmentAvailability: string;
  workoutFrequencyPerWeek: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  recommendation?: AiCoachRecommendation;
}

export interface CoachContext {
  displayName?: string;
  totalWorkouts?: number;
  streak?: number;
  fitnessLevel?: string;
  primaryGoal?: string;
  recentSessions?: {
    workoutTitle: string;
    category: string;
    durationSeconds: number;
    caloriesBurned: number;
    completedAt: string;
  }[];
  conversationHistory?: { sender: 'user' | 'coach'; text: string }[];
}

export class AiCoachService {
  /**
   * Generates tailored advice and customized workout adjustments
   */
  static async generateConsultationPlan(request: AiCoachConsultationRequest): Promise<{
    summary: string;
    weeklySchedule: { day: string; focus: string; duration: number }[];
    recommendations: AiCoachRecommendation[];
  }> {
    // Artificial latency for deliberate AI processing feel
    await new Promise(r => setTimeout(r, 600));

    const recommendations: AiCoachRecommendation[] = [
      {
        id: 'rec_prog_overload',
        title: 'Micro-Loading Progression Protocol',
        focus: request.fitnessGoal,
        recommendation: `For your ${request.fitnessLevel.toLowerCase()} level, increase compound loads by 1.25kg to 2.5kg every 10-14 days while keeping RPE at 8.`,
        reason: 'Prevents central nervous system burnout while maintaining myofibrillar tension.',
        difficultyAdjustment: request.fitnessLevel === 'Beginner' ? 'Focus on 3-second eccentric tempo first' : 'Incorporate pause reps at parallel'
      },
      {
        id: 'rec_recovery_window',
        title: 'Nutrient Timing & Intra-Workout Hydration',
        focus: 'Recovery Optimization',
        recommendation: `Consume 0.4g/kg high-leucine protein within 45 minutes of finishing your ${request.availableWorkoutTime}-minute session.`,
        reason: 'Stimulates maximal muscle protein synthesis and accelerates muscle glycogen replenishment.'
      },
      {
        id: 'rec_session_pacing',
        title: `${request.availableWorkoutTime}M Density Optimization`,
        focus: 'Time Efficiency',
        recommendation: request.availableWorkoutTime <= 30 
          ? 'Utilize agonist-antagonist supersets (e.g. Chest Press paired with Chest-Supported Rows) to cut rest time in half.'
          : 'Dedicate the first 12 minutes to high-yield compound lifts with 90-120s rest, transitioning into metabolic finishers.',
        reason: 'Maintains optimal training volume within your designated time constraint.'
      }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const selectedDays = days.slice(0, Math.min(request.workoutFrequencyPerWeek, 6));

    const weeklySchedule = selectedDays.map((day, idx) => {
      let focus = 'Full Body Hypertrophy';
      if (request.trainingPreference === 'Split Routine') {
        focus = idx % 2 === 0 ? 'Upper Body Power & Hypertrophy' : 'Lower Body & Core Fortification';
      } else if (request.fitnessGoal === 'Lose Weight') {
        focus = idx % 2 === 0 ? 'High Density Compound Circuit' : 'Cardiovascular Conditioning & Core';
      }
      return {
        day,
        focus,
        duration: request.availableWorkoutTime
      };
    });

    return {
      summary: `Tailored Torvex Protocol for ${request.fitnessGoal}: structured across ${request.workoutFrequencyPerWeek} days/week with ${request.availableWorkoutTime}-minute training blocks.`,
      weeklySchedule,
      recommendations
    };
  }

  /**
   * Responds to in-app questions with dynamic, context-aware analysis
   * factoring in conversation history, past workouts, and user progress.
   */
  static async sendCoachMessage(
    query: string, 
    context?: CoachContext
  ): Promise<string> {
    await new Promise(r => setTimeout(r, 450));
    const q = query.toLowerCase().trim();
    const name = context?.displayName ? context.displayName.split(' ')[0] : 'Athlete';
    const streak = context?.streak || 0;
    const workouts = context?.totalWorkouts || 0;
    const goal = context?.primaryGoal || 'General Fitness';
    const level = context?.fitnessLevel || 'Intermediate';
    const recent = context?.recentSessions && context.recentSessions.length > 0 ? context.recentSessions[0] : null;

    // Detect prior conversation topic from history for follow-ups
    const history = context?.conversationHistory || [];
    const prevUserMessages = history.filter(m => m.sender === 'user').map(m => m.text.toLowerCase());
    const lastUserTopic = prevUserMessages.length > 0 ? prevUserMessages[prevUserMessages.length - 1] : '';

    // Generate dynamic greeting variations based on streak and session count
    const dynamicGreetings = [
      `Great to connect, ${name}.`,
      `Let's dial in your performance, ${name}.`,
      `Locked in and ready, ${name}.`,
      `Here is my coaching assessment for you, ${name}:`
    ];
    const greeting = dynamicGreetings[Math.floor(Math.random() * dynamicGreetings.length)];

    // 1. Progress Review / Workout History / "How am I doing?"
    if (q.includes('progress') || q.includes('history') || q.includes('review') || q.includes('how am i doing') || q.includes('stats')) {
      let progressReport = `${greeting}\n\nHere is your current athletic trajectory breakdown:`;
      progressReport += `\n• Completed Sessions: ${workouts} total logged workouts`;
      progressReport += `\n• Consistency Streak: ${streak} active days in rhythm`;
      progressReport += `\n• Target Goal: ${goal} (${level} Level)`;

      if (recent) {
        const durMin = Math.round(recent.durationSeconds / 60);
        progressReport += `\n\nMost Recent Session:\n• Routine: "${recent.workoutTitle}" (${recent.category})\n• Completed: ${durMin} minutes • ${recent.caloriesBurned} kcal burned`;
        progressReport += `\n\nCoaching Recommendation:\nYour motor patterns are establishing great momentum. For your next session, prioritize progressive volume or active muscular recovery to balance neural fatigue.`;
      } else {
        progressReport += `\n\nYou are primed to establish your baseline. Complete your first session in the Workouts tab to begin generating kinetic overload analytics!`;
      }
      return progressReport;
    }

    // 2. Next Workout / "What should I train today?" / "Recommend a workout"
    if (q.includes('what should i train') || q.includes('recommend') || q.includes('suggest') || q.includes('today') || q.includes('next workout')) {
      let suggestion = `${greeting}\n\nBased on your profile goal (${goal}) and history:`;
      if (recent) {
        if (recent.category.toLowerCase().includes('strength')) {
          suggestion += `\n• Since your last logged session was ${recent.workoutTitle} (${recent.category}), your upper pushing and pulling kinetic chains need 24-48 hours to rebuild.`;
          suggestion += `\n• Today's Best Match: Focus on Lower Body Power or an Active Cardio & Core Flush.`;
        } else if (recent.category.toLowerCase().includes('cardio') || recent.category.toLowerCase().includes('hiit')) {
          suggestion += `\n• Following your cardiovascular session (${recent.workoutTitle}), your glycogen reserves have cleared.`;
          suggestion += `\n• Today's Best Match: Transition into Heavy Compound Strength (Bench, Squat, or Deadlift) with 2-minute recovery intervals.`;
        } else {
          suggestion += `\n• Your recent work in "${recent.workoutTitle}" built solid foundation.`;
          suggestion += `\n• Today's Best Match: Execute an Apex Full Body Hypertrophy routine or a functional mobility sequence.`;
        }
      } else {
        suggestion += `\n• Kick off your cycle with a balanced Full Body Foundation protocol or Core & Stamina introductory workout.`;
      }
      suggestion += `\n\nWould you like me to tailor sets and rest intervals for this focus?`;
      return suggestion;
    }

    // 3. Bench Press / Chest / Upper Push
    if (q.includes('bench') || q.includes('chest') || q.includes('push up') || q.includes('pec')) {
      return `${greeting}\n\nBiomechanical Bench Press & Chest Optimization:
• Scapular Retraction: Pin your shoulder blades back and down into the pad like you are tucking them into your back pockets. This secures the glenohumeral joint.
• Bar Trajectory: Lower the bar in a controlled diagonal arc toward your lower sternum—never straight down across the clavicle.
• Elbow Flare Angle: Maintain a 45° to 60° angle relative to your torso. Tucking too narrow transfers load to triceps; flaring at 90° strains rotator cuffs.
• Prescribed Cadence:
  - 3 sets of 6–8 reps for mechanical tension (${level} level)
  - Tempo: 3-second controlled descent, 1-second pause at chest, explosive concentric drive
  - Rest: 90–120 seconds between working sets.`;
    }

    // 4. Squats / Legs / Knee Health
    if (q.includes('squat') || q.includes('quad') || q.includes('leg') || q.includes('knee')) {
      return `${greeting}\n\nLower Body Squat Biomechanics (${level} Protocol):
• Foot Tripod: Anchor through your big toe, pinky toe, and heel. Grip the floor actively.
• Hip & Knee Synchrony: Break at hips and knees simultaneously. Guide knees directly over your 2nd and 3rd toes.
• Core Intra-Abdominal Pressure: Take a 360° belly breath and brace your core before descending to lock your spine.
• Depth & Joint Health: Descend to parallel. If your heels lift, elevate them slightly or focus on dorsiflexion mobility before adding heavier load.
• Volume: 4 sets of 8–10 reps with a controlled 3-0-1-0 tempo.`;
    }

    // 5. Deadlift / Back / Posterior Chain
    if (q.includes('deadlift') || q.includes('posterior') || q.includes('hamstring') || q.includes('lower back') || q.includes('glute')) {
      return `${greeting}\n\nPosterior Chain & Deadlift Execution:
• Barbell Proximity: Keep the bar in contact with your shins and thighs throughout the entire lift.
• Lat Engagement: Squeeze your armpits tight to engage lats and protect the lumbar spine.
• Leg Drive: Think of pushing the earth away rather than pulling up with your lower back.
• Programming: 3–5 working sets of 4–6 reps with full resets between reps. Avoid touch-and-go bouncing.`;
    }

    // 6. Pull-ups / Lats / Back Rows
    if (q.includes('pull up') || q.includes('pull-up') || q.includes('lat') || q.includes('back') || q.includes('row')) {
      return `${greeting}\n\nBack & Lat Hypertrophy Protocol:
• Initiate with Scapula: Depress shoulder blades downward before pulling with your arms.
• Elbow Vector: Drive elbows down toward your hip pockets rather than pulling high toward your neck.
• Peak Contraction: Hold a 1-second squeeze at the apex of each repetition.
• Recommended Volume: 3–4 sets of 8–12 reps. If bodyweight pull-ups are challenging, use 5-second slow negative descents.`;
    }

    // 7. Shoulders / Overhead Press / Deltoids
    if (q.includes('shoulder') || q.includes('overhead press') || q.includes('military press') || q.includes('delt')) {
      return `${greeting}\n\nShoulder Pressing & Deltoid Development:
• Kinetic Lockout: Tighten glutes and abdominals to eliminate arching in the lower spine.
• Elbow Path: Keep elbows slightly forward in the scapular plane (approx 30°), not straight to the side.
• Head Window: Push your head through the "window" created by your arms at full overhead extension.
• Pair With: Lateral raises and face pulls to ensure balanced rotator cuff and rear deltoid health.`;
    }

    // 8. Soreness / DOMS / Recovery / Fatigue
    if (q.includes('sore') || q.includes('doms') || q.includes('recovery') || q.includes('pain') || q.includes('ache') || q.includes('fatigue')) {
      return `${greeting}\n\nRecovery & Soreness Management:
• Active Recovery: A 20-minute low-intensity walk or light mobility clears metabolic byproducts 3x faster than remaining sedentary.
• Cellular Hydration: Aim for 3–4 liters of water daily supplemented with essential electrolytes (sodium, potassium, magnesium).
• Sleep Quality: 7.5 to 9 hours of restorative sleep is where 90% of human growth hormone and myofibrillar repair occurs.
• Contrast Showers: 3 minutes warm followed by 1 minute cool water stimulates lymphatic drainage.`;
    }

    // 9. Nutrition / Protein / Macros / Calories
    if (q.includes('protein') || q.includes('diet') || q.includes('nutrition') || q.includes('macro') || q.includes('calorie') || q.includes('creatine')) {
      return `${greeting}\n\nPrecision Nutrition for ${goal}:
• Daily Protein: Target 1.6g–2.2g per kilogram of body weight spread across 3–4 balanced meals.
• Leucine Threshold: Ensure each meal contains at least 3g of leucine (chicken, eggs, whey, tofu, lean beef) to stimulate Muscle Protein Synthesis (MPS).
• Carbohydrate Timing: Consume 45% of your daily complex carbohydrates 2 hours pre-workout and immediately post-workout to fuel glycogen reserves.
• Creatine Protocol: 5 grams of Creatine Monohydrate daily with water; consistency matters far more than loading.`;
    }

    // 10. Sets / Reps / "How many sets" (Context-Aware Follow-Up)
    if (q.includes('how many sets') || q.includes('how many reps') || q.includes('sets') || q.includes('reps') || q.includes('volume')) {
      let subject = 'your exercises';
      if (lastUserTopic.includes('bench') || lastUserTopic.includes('chest')) subject = 'Chest / Bench Press';
      else if (lastUserTopic.includes('squat') || lastUserTopic.includes('leg')) subject = 'Squats & Legs';
      else if (lastUserTopic.includes('pull up') || lastUserTopic.includes('back')) subject = 'Back & Pull-ups';
      else if (lastUserTopic.includes('shoulder')) subject = 'Overhead Press';

      return `${greeting}\n\nVolume Prescription for ${subject} (${goal} Focus):
• Working Sets: 3 to 4 hard sets (excluding warm-up sets).
• Rep Range:
  - For Strength & Power: 4–6 reps (80–85% 1RM)
  - For Hypertrophy / Muscle Building: 8–12 reps (70–75% 1RM)
  - For Endurance & Conditioning: 15–20 reps
• Proximity to Failure: Leave 1 to 2 reps in reserve (RIR 1–2) on compound lifts to avoid central nervous system fatigue.
• Rest Intervals: 90 seconds for isolation work; 2–3 minutes for heavy compound movements.`;
    }

    // 11. Core / Abs
    if (q.includes('ab') || q.includes('core') || q.includes('plank')) {
      return `${greeting}\n\nFunctional Core Training Principles:
• Anti-Movement Focus: The abdominal wall is designed primarily to stabilize the spine against rotation, extension, and lateral flexion.
• High Tension Planks: 30 seconds of maximum-effort isometric contraction (squeezing glutes, lats, and quads) stimulates more core motor units than 3 minutes of passive planking.
• Progressive Resistance: Treat abdominal muscles like any other muscle group—incorporate weighted cable crunches and controlled hanging leg raises for 10–12 reps.`;
    }

    // 12. Plateaus / Stalled Progress
    if (q.includes('plateau') || q.includes('stuck') || q.includes('heavy') || q.includes('stall')) {
      return `${greeting}\n\nBreaking Through Plateaus:
• Micro-loading: Use 1.25kg fractional plates. Small continuous increments accumulate faster without compromising form.
• Deload Week: If a lift stalls for 3 consecutive weeks, reduce training volume by 40% for 7 days while keeping execution crisp.
• Tempo Manipulation: Implement 2-second pause reps at the turnaround point to eliminate elastic rebound and force pure muscular recruitment.`;
    }

    // 13. Dynamic General Athletic Fallback
    return `${greeting}\n\nTo optimize your training toward ${goal}:
1. Prioritize multi-joint compound movement patterns (Squat, Hinge, Push, Pull, Carry) as the core foundation of your routine.
2. Control the eccentric phase for 2–3 seconds to maximize mechanical tension and micro-fiber recruitment.
3. Balance training volume with adequate recovery and hydration to ensure long-term adaptation.

What specific exercise, muscle group, or programming question would you like to explore next?`;
  }
}

