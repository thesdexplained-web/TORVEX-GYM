import 'package:flutter_bloc/flutter_bloc.dart';
import 'coach_event.dart';
import 'coach_state.dart';

class CoachBloc extends Bloc<CoachEvent, CoachState> {
  CoachBloc()
      : super(CoachState(messages: [
          CoachMessage(
            sender: 'coach',
            text: 'Greetings Athlete. I am Torvex AI, your elite performance & biomechanics coach. Ask for routine tailoring, form tips, or dynamic rest optimization.',
            timestamp: DateTime.now(),
          ),
        ])) {
    on<SendCoachMessageEvent>(_onSendMessage);
    on<ClearCoachChatEvent>(_onClear);
  }

  Future<void> _onSendMessage(SendCoachMessageEvent event, Emitter<CoachState> emit) async {
    final userMsg = CoachMessage(
      sender: 'user',
      text: event.message,
      timestamp: DateTime.now(),
    );

    final listWithUser = List<CoachMessage>.from(state.messages)..add(userMsg);
    emit(state.copyWith(messages: listWithUser, isThinking: true));

    await Future.delayed(const Duration(milliseconds: 1400));

    final reply = _generateCoachReply(event.message);
    final botMsg = CoachMessage(
      sender: 'coach',
      text: reply,
      timestamp: DateTime.now(),
    );

    final finalList = List<CoachMessage>.from(listWithUser)..add(botMsg);
    emit(state.copyWith(messages: finalList, isThinking: false));
  }

  void _onClear(ClearCoachChatEvent event, Emitter<CoachState> emit) {
    emit(CoachState(messages: [
      CoachMessage(
        sender: 'coach',
        text: 'Chat cleared. How can I optimize your next training block?',
        timestamp: DateTime.now(),
      ),
    ]));
  }

  String _generateCoachReply(String input) {
    final lower = input.toLowerCase();
    if (lower.contains('hiit') || lower.contains('cardio')) {
      return 'For HIIT conditioning: Perform 30s max-output row/sprint followed by 45s active recovery across 6 rounds. Focus on nasal breathing during recovery.';
    } else if (lower.contains('squat') || lower.contains('knee')) {
      return 'Squat Mechanics: Ensure knees track in line with 2nd and 3rd toes. Maintain active intra-abdominal pressure (Valksalva maneuver) before breaking the hips.';
    } else if (lower.contains('protein') || lower.contains('diet')) {
      return 'Nutrition Directive: Target 1.8g - 2.2g protein per kg of bodyweight daily. Distribute across 4-5 feedings with at least 3g leucine per bolus.';
    }
    return 'Analysis Complete: Prioritize mechanical tension with progressive overload. Target 2 reps in reserve (RIR 2) on multi-joint compounds for optimal hypertrophy without systemic fatigue.';
  }
}
