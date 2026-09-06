import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static Future<void> setDarkMode(bool isDark) async {
    await _prefs?.setBool('torvex_dark_mode', isDark);
  }

  static bool getDarkMode() {
    return _prefs?.getBool('torvex_dark_mode') ?? true;
  }

  static Future<void> saveFavoriteIds(List<String> ids) async {
    await _prefs?.setStringList('torvex_favorite_workouts', ids);
  }

  static List<String> getFavoriteIds() {
    return _prefs?.getStringList('torvex_favorite_workouts') ?? [];
  }

  static Future<void> saveOfflineSessions(List<Map<String, dynamic>> sessions) async {
    final raw = jsonEncode(sessions);
    await _prefs?.setString('torvex_offline_sessions_queue', raw);
  }

  static List<Map<String, dynamic>> getOfflineSessions() {
    final raw = _prefs?.getString('torvex_offline_sessions_queue');
    if (raw == null || raw.isEmpty) return [];
    try {
      final decoded = jsonDecode(raw) as List;
      return decoded.map((e) => Map<String, dynamic>.from(e)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> saveUserProStatus(bool isPro) async {
    await _prefs?.setBool('torvex_user_is_pro', isPro);
  }

  static bool getUserProStatus() {
    return _prefs?.getBool('torvex_user_is_pro') ?? false;
  }
}
