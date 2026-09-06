import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import '../services/storage_service.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  FirebaseFirestore? _firestore;
  FirebaseAuth? _auth;
  bool _isFirebaseReady = false;

  bool get isReady => _isFirebaseReady;
  String get currentUserId => _auth?.currentUser?.uid ?? 'guest_user_torvex';

  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      _firestore = FirebaseFirestore.instance;
      _auth = FirebaseAuth.instance;
      _isFirebaseReady = true;
      debugPrint('[FirebaseService] Firebase initialized successfully');
    } catch (e) {
      debugPrint('[FirebaseService] Running in offline/fallback mode: $e');
      _isFirebaseReady = false;
    }
  }

  Future<void> syncWorkoutSession(Map<String, dynamic> sessionData) async {
    if (_isFirebaseReady && _firestore != null) {
      try {
        final sessionId = sessionData['sessionId'] as String;
        await _firestore!
            .collection('users')
            .doc(currentUserId)
            .collection('workout_sessions')
            .doc(sessionId)
            .set(sessionData, SetOptions(merge: true));
        debugPrint('[FirebaseService] Synced session $sessionId to Cloud Firestore');
        return;
      } catch (e) {
        debugPrint('[FirebaseService] Firestore write failed, caching offline: $e');
      }
    }

    // Offline storage fallback
    final offlineList = StorageService.getOfflineSessions();
    offlineList.add(sessionData);
    await StorageService.saveOfflineSessions(offlineList);
  }

  Future<List<Map<String, dynamic>>> fetchWorkoutHistory() async {
    if (_isFirebaseReady && _firestore != null) {
      try {
        final snapshot = await _firestore!
            .collection('users')
            .doc(currentUserId)
            .collection('workout_sessions')
            .orderBy('startedAt', descending: true)
            .limit(30)
            .get();

        return snapshot.docs.map((doc) => doc.data()).toList();
      } catch (e) {
        debugPrint('[FirebaseService] Error fetching sessions: $e');
      }
    }
    return StorageService.getOfflineSessions();
  }

  Future<void> updateUserSubscription(Map<String, dynamic> subData) async {
    if (_isFirebaseReady && _firestore != null) {
      try {
        await _firestore!
            .collection('users')
            .doc(currentUserId)
            .collection('subscription')
            .doc('current')
            .set(subData, SetOptions(merge: true));
      } catch (e) {
        debugPrint('[FirebaseService] Error updating subscription: $e');
      }
    }
    await StorageService.saveUserProStatus(subData['entitlement'] == 'pro');
  }
}
