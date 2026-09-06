import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class PlatformUtils {
  static bool get isWebPlatform => kIsWeb;

  static bool isMobileScreen(BuildContext context) {
    return MediaQuery.of(context).size.width < 768;
  }

  static bool isTabletScreen(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= 768 && width < 1024;
  }

  static bool isDesktopScreen(BuildContext context) {
    return MediaQuery.of(context).size.width >= 1024;
  }

  static double contentMaxWidth(BuildContext context) {
    if (isDesktopScreen(context)) return 1100;
    if (isTabletScreen(context)) return 720;
    return double.infinity;
  }
}
