import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import 'active_workout_event.dart';
import 'active_workout_state.dart';
import '../../models/session_model.dart';
import '../../core/services/notification_service.dart';
import '../../core/services/firebase_service.dart';

class ActiveWorkoutBloc extends Bloc<ActiveWorkoutEvent, ActiveWorkoutState> {
  Timer? _timer;

  ActiveWorkoutBloc() : super(const ActiveWorkoutState()) {
    on<StartActiveWorkoutEvent>(_onStart);
    on<NextExerciseEvent>(_onNextExercise);
    on<PreviousExerciseEvent>(_onPreviousExercise);
    on<ToggleSetCompletedEvent>(_onToggleSet);
    on<UpdateSetValuesEvent>(_onUpdateSetValues);
    on<StartRestTimerEvent>(_onStartRestTimer);
    on<TickWorkoutTimerEvent>(_onTick);
    on<FinishWorkoutSessionEvent>(_onFinish);
  }

  void _onStart(StartActiveWorkoutEvent event, Emitter<ActiveWorkoutState> emit) {
    _timer?.cancel();

    final Map<int, List<SetLog>> initialLogs = {};
    for (int i = 0; i < event.workout.exercises.length; i++) {
      final item = event.workout.exercises[i];
      initialLogs[i] = List.generate(
        item.sets,
        (idx) => SetLog(
          setNumber: idx + 1,
          reps: item.reps,
          weightKg: item.weightKg,
          completed: false,
        ),
      );
    }

    emit(ActiveWorkoutState(
      status: ActiveWorkoutStatus.running,
      currentWorkout: event.workout,
      currentExerciseIndex: 0,
      elapsedSeconds: 0,
      exerciseSetLogs: initialLogs,
      burnedCalories: 0,
    ));

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      add(TickWorkoutTimerEvent());
    });
  }

  void _onTick(TickWorkoutTimerEvent event, Emitter<ActiveWorkoutState> emit) {
    final nextElapsed = state.elapsedSeconds + 1;
    // Estimate burned calories ~ 8-10 kcal / min
    final cals = (nextElapsed / 60 * 8.5).round();

    if (state.restRemainingSeconds > 0) {
      final nextRest = state.restRemainingSeconds - 1;
      if (nextRest == 0) {
        NotificationService().showRestTimerFinished(seconds: state.restTotalSeconds);
        emit(state.copyWith(
          status: ActiveWorkoutStatus.running,
          elapsedSeconds: nextElapsed,
          restRemainingSeconds: 0,
          burnedCalories: cals,
        ));
        return;
      }
      emit(state.copyWith(
        elapsedSeconds: nextElapsed,
        restRemainingSeconds: nextRest,
        burnedCalories: cals,
      ));
    } else {
      emit(state.copyWith(
        elapsedSeconds: nextElapsed,
        burnedCalories: cals,
      ));
    }
  }

  void _onNextExercise(NextExerciseEvent event, Emitter<ActiveWorkoutState> emit) {
    if (state.currentWorkout == null) return;
    if (state.currentExerciseIndex < state.currentWorkout!.exercises.length - 1) {
      emit(state.copyWith(currentExerciseIndex: state.currentExerciseIndex + 1));
    }
  }

  void _onPreviousExercise(PreviousExerciseEvent event, Emitter<ActiveWorkoutState> emit) {
    if (state.currentExerciseIndex > 0) {
      emit(state.copyWith(currentExerciseIndex: state.currentExerciseIndex - 1));
    }
  }

  void _onToggleSet(ToggleSetCompletedEvent event, Emitter<ActiveWorkoutState> emit) {
    final curIndex = state.currentExerciseIndex;
    final curSets = List<SetLog>.from(state.currentSets);
    if (event.setIndex < curSets.length) {
      final old = curSets[event.setIndex];
      curSets[event.setIndex] = old.copyWith(completed: !old.completed);

      final updatedMap = Map<int, List<SetLog>>.from(state.exerciseSetLogs);
      updatedMap[curIndex] = curSets;
      emit(state.copyWith(exerciseSetLogs: updatedMap));

      // Trigger auto rest timer if completed
      if (curSets[event.setIndex].completed) {
        final restSec = state.currentExercise?.restSeconds ?? 60;
        add(StartRestTimerEvent(restSec));
      }
    }
  }

  void _onUpdateSetValues(UpdateSetValuesEvent event, Emitter<ActiveWorkoutState> emit) {
    final curIndex = state.currentExerciseIndex;
    final curSets = List<SetLog>.from(state.currentSets);
    if (event.setIndex < curSets.length) {
      curSets[event.setIndex] = curSets[event.setIndex].copyWith(
        reps: event.reps,
        weightKg: event.weightKg,
      );
      final updatedMap = Map<int, List<SetLog>>.from(state.exerciseSetLogs);
      updatedMap[curIndex] = curSets;
      emit(state.copyWith(exerciseSetLogs: updatedMap));
    }
  }

  void _onStartRestTimer(StartRestTimerEvent event, Emitter<ActiveWorkoutState> emit) {
    emit(state.copyWith(
      status: ActiveWorkoutStatus.restTimer,
      restRemainingSeconds: event.seconds,
      restTotalSeconds: event.seconds,
    ));
  }

  Future<void> _onFinish(FinishWorkoutSessionEvent event, Emitter<ActiveWorkoutState> emit) async {
    _timer?.cancel();
    if (state.currentWorkout != null) {
      final sessionModel = WorkoutSessionModel(
        sessionId: 'torvex_sess_${const Uuid().v4()}',
        userId: FirebaseService().currentUserId,
        workoutId: state.currentWorkout!.workoutId,
        workoutTitle: state.currentWorkout!.title,
        category: state.currentWorkout!.category,
        startedAt: DateTime.now().subtract(Duration(seconds: state.elapsedSeconds)),
        completedAt: DateTime.now(),
        durationSeconds: state.elapsedSeconds,
        caloriesBurned: state.burnedCalories,
        completionStatus: 'completed',
        exerciseLogs: state.exerciseSetLogs.entries.map((e) => {
          'exerciseIndex': e.key,
          'sets': e.value.map((s) => s.toMap()).toList(),
        }).toList(),
      );

      await FirebaseService().syncWorkoutSession(sessionModel.toMap());
      await NotificationService().showWorkoutCompleted(
        title: state.currentWorkout!.title,
        calories: state.burnedCalories,
      );
    }

    emit(state.copyWith(status: ActiveWorkoutStatus.completed));
  }

  @override
  Future<void> close() {
    _timer?.cancel();
    return super.close();
  }
}
