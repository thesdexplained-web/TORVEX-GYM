import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/storage_service.dart';
import '../../bloc/subscription/subscription_bloc.dart';
import '../../bloc/subscription/subscription_state.dart';
import '../subscription/paywall_dialog.dart';

class ProfileScreen extends StatefulWidget {
  final Function(bool) onToggleTheme;

  const ProfileScreen({Key? key, required this.onToggleTheme}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _darkMode = StorageService.getDarkMode();
  bool _healthSync = true;
  bool _pushNotifications = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isPro = context.watch<SubscriptionBloc>().state.isPro;

    return Scaffold(
      appBar: AppBar(
        title: const Text('ATHLETE PROFILE', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppColors.primaryAmber,
                  child: const Text('TG', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Torvex Athlete', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 4),
                      Text(
                        'athlete@torvexgym.com',
                        style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isPro ? AppColors.primaryAmber : Colors.grey.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isPro ? 'TORVEX PRO' : 'FREE TIER',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: isPro ? Colors.black : Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Subscription Banner
          if (!isPro)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.primaryAmber.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primaryAmber),
              ),
              child: Row(
                children: [
                  const Icon(Icons.star, color: AppColors.primaryAmber, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Upgrade to Torvex Pro', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        Text('Unlock all routines & AI Coach features', style: TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryAmber,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => PaywallDialog.show(context),
                    child: const Text('UPGRADE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 24),
          const Text('PREFERENCES & INTEGRATIONS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          _buildSwitchTile('Dark Mode Theme', 'Torvex signature high-contrast palette', _darkMode, (val) {
            setState(() => _darkMode = val);
            StorageService.setDarkMode(val);
            widget.onToggleTheme(val);
          }, isDark),
          _buildSwitchTile('Health & Biometric Sync', 'Apple Health & Google Health Connect integration', _healthSync, (val) {
            setState(() => _healthSync = val);
          }, isDark),
          _buildSwitchTile('Local Training Alerts', 'Push reminders for scheduled workout sessions', _pushNotifications, (val) {
            setState(() => _pushNotifications = val);
          }, isDark),
          const SizedBox(height: 32),
          Center(
            child: Text(
              'TORVEX GYM ENGINE v1.0.0 (Production Flutter)',
              style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool val, Function(bool) onChanged, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
      ),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted)),
        value: val,
        activeColor: AppColors.primaryAmber,
        contentPadding: EdgeInsets.zero,
        onChanged: onChanged,
      ),
    );
  }
}
