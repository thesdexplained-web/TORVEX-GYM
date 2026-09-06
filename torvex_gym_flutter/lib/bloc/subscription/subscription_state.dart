import 'package:equatable/equatable.dart';
import '../../models/subscription_model.dart';

class SubscriptionState extends Equatable {
  final UserSubscription subscription;
  final bool isLoading;
  final String? message;

  const SubscriptionState({
    required this.subscription,
    this.isLoading = false,
    this.message,
  });

  bool get isPro => subscription.isPro;

  SubscriptionState copyWith({
    UserSubscription? subscription,
    bool? isLoading,
    String? message,
  }) {
    return SubscriptionState(
      subscription: subscription ?? this.subscription,
      isLoading: isLoading ?? this.isLoading,
      message: message,
    );
  }

  @override
  List<Object?> get props => [subscription, isLoading, message];
}
