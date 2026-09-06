import 'package:equatable/equatable.dart';

abstract class CoachEvent extends Equatable {
  const CoachEvent();
  @override
  List<Object?> get props => [];
}

class SendCoachMessageEvent extends CoachEvent {
  final String message;
  const SendCoachMessageEvent(this.message);
  @override
  List<Object?> get props => [message];
}

class ClearCoachChatEvent extends CoachEvent {}
