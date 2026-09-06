import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/services/storage_service.dart';
import 'core/services/notification_service.dart';
import 'core/services/firebase_service.dart';
import 'bloc/workout/workout_bloc.dart';
import 'bloc/workout/workout_event.dart';
import 'bloc/active_workout/active_workout_bloc.dart';
import 'bloc/subscription/subscription_bloc.dart';
import 'bloc/subscription/subscription_event.dart';
import 'bloc/coach/coach_bloc.dart';
import 'views/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Core Services
  await StorageService.init();
  await NotificationService().initialize();
  await FirebaseService().initialize();

  runApp(const TorvexGymApp());
}

class TorvexGymApp extends StatefulWidget {
  const TorvexGymApp({Key? key}) : super(key: key);

  @override
  State<TorvexGymApp> createState() => _TorvexGymAppState();
}

class _TorvexGymAppState extends State<TorvexGymApp> {
  bool _isDark = StorageService.getDarkMode();

  void _toggleTheme(bool isDark) {
    setState(() {
      _isDark = isDark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<WorkoutBloc>(
          create: (_) => WorkoutBloc()..add(LoadWorkoutsEvent()),
        ),
        BlocProvider<ActiveWorkoutBloc>(
          create: (_) => ActiveWorkoutBloc(),
        ),
        BlocProvider<SubscriptionBloc>(
          create: (_) => SubscriptionBloc()..add(LoadSubscriptionEvent()),
        ),
        BlocProvider<CoachBloc>(
          create: (_) => CoachBloc(),
        ),
      ],
      child: MaterialApp(
        title: 'Torvex Gym',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: _isDark ? ThemeMode.dark : ThemeMode.light,
        home: MainNavigation(onToggleTheme: _toggleTheme),
      ),
    );
  }
}
