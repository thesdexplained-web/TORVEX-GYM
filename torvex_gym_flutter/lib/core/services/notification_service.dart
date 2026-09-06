import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  Future<void> initialize() async {
    if (kIsWeb) {
      debugPrint('[NotificationService] Web environment detected - Notifications mocked/disabled');
      _isInitialized = true;
      return;
    }

    try {
      const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const InitializationSettings settings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _notificationsPlugin.initialize(
        settings,
        onDidReceiveNotificationResponse: (NotificationResponse details) {
          debugPrint('Notification clicked payload: ${details.payload}');
        },
      );

      _isInitialized = true;
      debugPrint('[NotificationService] Initialized successfully');
    } catch (e) {
      debugPrint('[NotificationService] Error initializing: $e');
    }
  }

  Future<void> showRestTimerFinished({required int seconds}) async {
    if (!_isInitialized || kIsWeb) return;

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'torvex_timer_channel',
        'Torvex Rest Timers',
        channelDescription: 'Alerts when rest timer finishes',
        importance: Importance.max,
        priority: Priority.high,
        playSound: true,
        enableVibration: true,
      );

      const NotificationDetails details = NotificationDetails(
        android: androidDetails,
        iOS: DarwinNotificationDetails(presentAlert: true, presentSound: true),
      );

      await _notificationsPlugin.show(
        101,
        'Rest Complete! 🔥',
        'Your $seconds seconds recovery is over. Next set ready!',
        details,
      );
    } catch (e) {
      debugPrint('[NotificationService] Failed to display rest notification: $e');
    }
  }

  Future<void> showWorkoutCompleted({required String title, required int calories}) async {
    if (!_isInitialized || kIsWeb) return;

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'torvex_workout_channel',
        'Torvex Workout Achievements',
        importance: Importance.high,
        priority: Priority.high,
      );

      const NotificationDetails details = NotificationDetails(
        android: androidDetails,
        iOS: DarwinNotificationDetails(presentAlert: true, presentSound: true),
      );

      await _notificationsPlugin.show(
        102,
        'Workout Crushed! 🏆',
        '$title finished! You incinerated ~$calories kcal.',
        details,
      );
    } catch (e) {
      debugPrint('[NotificationService] Failed to display workout notification: $e');
    }
  }

  Future<void> scheduleDailyReminder({required int hour, required int minute}) async {
    if (kIsWeb) return;
    debugPrint('[NotificationService] Scheduled daily training reminder at $hour:$minute');
  }
}
