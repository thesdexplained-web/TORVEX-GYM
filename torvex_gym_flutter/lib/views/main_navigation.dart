import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import 'home/home_screen.dart';
import 'workouts/workouts_screen.dart';
import 'progress/progress_screen.dart';
import 'coach/coach_screen.dart';
import 'profile/profile_screen.dart';

class MainNavigation extends StatefulWidget {
  final Function(bool) onToggleTheme;

  const MainNavigation({Key? key, required this.onToggleTheme}) : super(key: key);

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final List<Widget> screens = [
      HomeScreen(onTabChange: (i) => setState(() => _currentIndex = i)),
      const WorkoutsScreen(),
      const ProgressScreen(),
      const CoachScreen(),
      ProfileScreen(onToggleTheme: widget.onToggleTheme),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: isDark ? AppColors.darkCardElevated : AppColors.lightCard,
        indicatorColor: AppColors.primaryAmber.withOpacity(0.2),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home, color: AppColors.primaryAmber), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.fitness_center_outlined), selectedIcon: Icon(Icons.fitness_center, color: AppColors.primaryAmber), label: 'Workouts'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart, color: AppColors.primaryAmber), label: 'Progress'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), selectedIcon: Icon(Icons.smart_toy, color: AppColors.primaryAmber), label: 'AI Coach'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person, color: AppColors.primaryAmber), label: 'Profile'),
        ],
      ),
    );
  }
}
