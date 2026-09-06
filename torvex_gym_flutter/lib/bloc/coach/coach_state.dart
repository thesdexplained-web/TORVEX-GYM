import 'package:equatable/equatable.dart';

class CoachMessage extends Equatable {
  final String sender; // 'user' or 'coach'
  final String text;
  final DateTime timestamp;

  const CoachMessage({
    required this.sender,
    required this.text,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [sender, text, timestamp];
}

class CoachState extends Equatable {
  final List<CoachMessage> messages;
  final bool isThinking;

  const CoachState({
    this.messages = const [],
    this.isThinking = false,
  });

  CoachState copyWith({
    List<CoachMessage>? messages,
    bool? isThinking,
  }) {
    return CoachState(
      messages: messages ?? this.messages,
      isThinking: isThinking ?? this.isThinking,
    );
  }

  @override
  List<Object?> get props => [messages, isThinking];
}
