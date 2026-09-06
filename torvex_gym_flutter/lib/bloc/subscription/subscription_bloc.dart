import 'package:flutter_bloc/flutter_bloc.dart';
import 'subscription_event.dart';
import 'subscription_state.dart';
import '../../models/subscription_model.dart';
import '../../core/services/storage_service.dart';
import '../../core/services/firebase_service.dart';

class SubscriptionBloc extends Bloc<SubscriptionEvent, SubscriptionState> {
  SubscriptionBloc()
      : super(SubscriptionState(
          subscription: UserSubscription(
            userId: FirebaseService().currentUserId,
            tier: StorageService.getUserProStatus() ? SubscriptionTier.pro : SubscriptionTier.free,
            planType: 'monthly',
          ),
        )) {
    on<LoadSubscriptionEvent>(_onLoad);
    on<UpgradeToProEvent>(_onUpgrade);
    on<RestoreSubscriptionEvent>(_onRestore);
  }

  Future<void> _onLoad(LoadSubscriptionEvent event, Emitter<SubscriptionState> emit) async {
    final isPro = StorageService.getUserProStatus();
    emit(state.copyWith(
      subscription: UserSubscription(
        userId: FirebaseService().currentUserId,
        tier: isPro ? SubscriptionTier.pro : SubscriptionTier.free,
        planType: 'monthly',
      ),
    ));
  }

  Future<void> _onUpgrade(UpgradeToProEvent event, Emitter<SubscriptionState> emit) async {
    emit(state.copyWith(isLoading: true));
    await Future.delayed(const Duration(milliseconds: 1200)); // Simulate transaction

    final updated = UserSubscription(
      userId: FirebaseService().currentUserId,
      tier: SubscriptionTier.pro,
      planType: event.planType,
      expiresAt: DateTime.now().add(const Duration(days: 30)),
      autoRenew: true,
    );

    await FirebaseService().updateUserSubscription(updated.toMap());
    emit(state.copyWith(
      subscription: updated,
      isLoading: false,
      message: 'Welcome to Torvex Pro! All workouts and AI features unlocked.',
    ));
  }

  Future<void> _onRestore(RestoreSubscriptionEvent event, Emitter<SubscriptionState> emit) async {
    emit(state.copyWith(isLoading: true));
    await Future.delayed(const Duration(seconds: 1));
    emit(state.copyWith(
      isLoading: false,
      message: 'Active subscriptions restored successfully.',
    ));
  }
}
