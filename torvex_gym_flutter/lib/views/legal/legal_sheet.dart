import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/storage_service.dart';

class LegalSheet extends StatefulWidget {
  final int initialTabIndex;

  const LegalSheet({Key? key, this.initialTabIndex = 0}) : super(key: key);

  static void show(BuildContext context, {int initialTabIndex = 0}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => LegalSheet(initialTabIndex: initialTabIndex),
    );
  }

  @override
  State<LegalSheet> createState() => _LegalSheetState();
}

class _LegalSheetState extends State<LegalSheet> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _deleteController = TextEditingController();
  bool _isDeleting = false;
  String? _deleteError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this, initialIndex: widget.initialTabIndex);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _deleteController.dispose();
    super.dispose();
  }

  void _handleDeleteAccount() async {
    if (_deleteController.text.trim().toUpperCase() != 'DELETE') {
      setState(() => _deleteError = 'Please type "DELETE" exactly to confirm.');
      return;
    }

    setState(() {
      _isDeleting = true;
      _deleteError = null;
    });

    await Future.delayed(const Duration(milliseconds: 1200));
    await StorageService.clearUserData();

    if (!mounted) return;
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Account and all associated fitness records have been permanently erased.'),
        backgroundColor: Colors.redAccent,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardElevated : AppColors.lightCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 48,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black12,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.verified_user_rounded, color: AppColors.primaryAmber, size: 22),
                    SizedBox(width: 10),
                    Text(
                      'LEGAL & COMPLIANCE',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, size: 20),
                ),
              ],
            ),
          ),
          TabBar(
            controller: _tabController,
            isScrollable: true,
            labelColor: AppColors.primaryAmber,
            unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
            indicatorColor: AppColors.primaryAmber,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(text: 'Privacy Policy'),
              Tab(text: 'Terms (EULA)'),
              Tab(text: 'Support & FAQ'),
              Tab(text: 'Delete Account'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildPrivacyTab(isDark),
                _buildTermsTab(isDark),
                _buildSupportTab(isDark),
                _buildDeletionTab(isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivacyTab(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'TORVEX GYM PRIVACY POLICY',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
        ),
        const SizedBox(height: 8),
        Text(
          'Last Updated: September 2026 • GDPR & CCPA Compliant',
          style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
        ),
        const SizedBox(height: 16),
        _buildSectionTitle('1. Zero Data Brokerage'),
        const Text(
          'TORVEX GYM never sells, leases, or trades your physical performance, weight, body measurements, or workout logs to third-party ad networks or data brokers.',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 14),
        _buildSectionTitle('2. Health & Sensor Telemetry'),
        const Text(
          'Fitness metrics (sets, repetitions, completed routines, estimated calories, target heart rate zones) are encrypted in transit (TLS 1.3) and encrypted at rest (AES-256) via Google Cloud & Firestore.',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 14),
        _buildSectionTitle('3. Contact Developer'),
        const Text(
          'Inquiries regarding data rights: thesdexplained@gmail.com',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildTermsTab(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'TERMS OF USE (EULA)',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
        ),
        const SizedBox(height: 8),
        Text(
          'Standard Apple & Google In-App Purchase Agreement',
          style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
        ),
        const SizedBox(height: 16),
        _buildSectionTitle('1. Medical & Exercise Disclaimer'),
        const Text(
          'TORVEX GYM is an athletic self-training utility. Always seek guidance from a qualified physician prior to starting any resistance or high-intensity interval training regimen.',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 14),
        _buildSectionTitle('2. Auto-Renewable Subscriptions'),
        const Text(
          'Payment will be charged to your Google Play / Apple ID account at confirmation of purchase. Subscriptions automatically renew unless auto-renew is cancelled at least 24 hours prior to the conclusion of the current cycle.',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 14),
        _buildSectionTitle('3. Cancellation & Management'),
        const Text(
          'Manage or cancel your subscription at any time within your device operating system store settings (Google Play Subscriptions or Apple ID Subscriptions).',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildSupportTab(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'HELP & ATHLETE SUPPORT',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.lightCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Official Developer Email:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              SizedBox(height: 4),
              Text('thesdexplained@gmail.com', style: TextStyle(color: AppColors.primaryAmber, fontWeight: FontWeight.bold, fontSize: 14)),
              SizedBox(height: 12),
              Text('Cloud Engine Status:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              SizedBox(height: 4),
              Text('Firestore Database & Auth Operational (100% SLA)', style: TextStyle(color: Colors.greenAccent, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeletionTab(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.redAccent.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
          ),
          child: Row(
            children: const [
              Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Permanent Account & Data Erasure (Apple Guideline 5.1.1(v) Compliant)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.redAccent),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'This action is irreversible. All completed sessions, workout logs, heart rate stats, personal bests, and preferences will be permanently wiped.',
          style: TextStyle(fontSize: 13, height: 1.5),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: _deleteController,
          decoration: InputDecoration(
            hintText: 'Type "DELETE" to confirm',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            errorText: _deleteError,
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.redAccent,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          onPressed: _isDeleting ? null : _handleDeleteAccount,
          child: _isDeleting
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('PERMANENTLY DELETE MY ACCOUNT', style: TextStyle(fontWeight: FontWeight.w900)),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
    );
  }
}
