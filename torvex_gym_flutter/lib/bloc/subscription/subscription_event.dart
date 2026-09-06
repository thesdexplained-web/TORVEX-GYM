import 'package:equatable/equatable.dart';
import '../../models/subscription_model.dart';

abstract class SubscriptionEvent extends Equatable {
  const SubscriptionEvent();
  @override
  List<Object?> get props => [];
}

class LoadSubscriptionEvent extends SubscriptionEvent {}

class UpgradeToProEvent extends SubscriptionEvent {
  final String planType; // 'monthly', 'annual'
  const UpgradeToProEvent(this.planType);
  @override
  List<Object?> get props => [planType];
}

class RestoreSubscriptionEvent extends SubscriptionEvent {}
