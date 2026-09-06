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
   * Responds to in-app questions to the AI Coach
   */
  static async sendCoachMessage(query: string, currentContext?: { totalWorkouts: number; streak: number }): Promise<string> {
    await new Promise(r => setTimeout(r, 500));
    const q = query.toLowerCase();

    if (q.includes('sore') || q.includes('doms') || q.includes('pain')) {
      return "Delayed Onset Muscle Soreness (DOMS) is natural after novel microtrauma. Unless you feel sharp joint discomfort, engage in 15 minutes of low-intensity walking or our Functional Mobility & Decompression routine to accelerate blood flow and lymphatic drainage.";
    }
    if (q.includes('protein') || q.includes('diet') || q.includes('nutrition') || q.includes('food')) {
      return "For athletic body composition, aim for 1.6g to 2.2g of protein per kilogram of target body weight daily. Distribute this evenly across 3–4 meals with at least 3g of leucine per serving to trigger mTOR signaling.";
    }
    if (q.includes('streak') || q.includes('motivation') || q.includes('tired')) {
      return `You have logged ${currentContext?.totalWorkouts || 0} workouts with a ${currentContext?.streak || 0}-day streak. On low-energy days, lower the load by 20% or switch to our 20-minute Mobility flow. Consistency in motion is what builds irreversible physical transformation.`;
    }
    if (q.includes('squat') || q.includes('bench') || q.includes('deadlift') || q.includes('form')) {
      return "For compound safety: 1) Anchor tripod foot pressure (big toe, pinky toe, heel), 2) Create 360-degree intra-abdominal pressure using the Valsalva maneuver before descent, and 3) Keep your ribcage stacked directly above your pelvis.";
    }

    return "Torvex AI Coach active: Focus on progressive overload, strict 3-second eccentric negatives, and maintaining deliberate mind-muscle contraction on every set. What specific movement or nutritional goal would you like to dial in?";
  }
}
