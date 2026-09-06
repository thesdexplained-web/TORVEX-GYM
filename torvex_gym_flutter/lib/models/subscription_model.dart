import 'package:equatable/equatable.dart';

enum SubscriptionTier { free, pro }

class UserSubscription extends Equatable {
  final String userId;
  final SubscriptionTier tier;
  final String planType; // 'monthly', 'annual'
  final DateTime? expiresAt;
  final bool autoRenew;

  const UserSubscription({
    required this.userId,
    required this.tier,
    required this.planType,
    this.expiresAt,
    this.autoRenew = false,
  });

  bool get isPro => tier == SubscriptionTier.pro;

  Map<String, dynamic> toMap() => {
    'userId': userId,
    'entitlement': isPro ? 'pro' : 'free',
    'planType': planType,
    'expiresAt': expiresAt?.toIso8601String(),
    'autoRenew': autoRenew,
  };

  factory UserSubscription.fromMap(Map<String, dynamic> map) => UserSubscription(
    userId: map['userId'] ?? '',
    tier: (map['entitlement'] == 'pro') ? SubscriptionTier.pro : SubscriptionTier.free,
    planType: map['planType'] ?? 'monthly',
    expiresAt: map['expiresAt'] != null ? DateTime.tryParse(map['expiresAt']) : null,
    autoRenew: map['autoRenew'] ?? false,
  );

  @override
  List<Object?> get props => [userId, tier, planType, autoRenew];
}
