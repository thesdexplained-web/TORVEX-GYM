import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../bloc/coach/coach_bloc.dart';
import '../../bloc/coach/coach_event.dart';
import '../../bloc/coach/coach_state.dart';

class CoachScreen extends StatefulWidget {
  const CoachScreen({Key? key}) : super(key: key);

  @override
  State<CoachScreen> createState() => _CoachScreenState();
}

class _CoachScreenState extends State<CoachScreen> {
  final TextEditingController _msgController = TextEditingController();

  final List<String> _quickPrompts = [
    'Quick 20-min HIIT Routine',
    'How to avoid knee pain in squats?',
    'Optimal post-workout protein timing',
    'Explain progressive overload mechanics',
  ];

  @override
  void dispose() {
    _msgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.smart_toy_rounded, color: AppColors.primaryAmber),
            SizedBox(width: 8),
            Text('TORVEX AI COACH', style: TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<CoachBloc>().add(ClearCoachChatEvent());
            },
          ),
        ],
      ),
      body: BlocBuilder<CoachBloc, CoachState>(
        builder: (context, state) {
          return Column(
            children: [
              // Messages list
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.messages.length,
                  itemBuilder: (ctx, i) {
                    final msg = state.messages[i];
                    final isCoach = msg.sender == 'coach';

                    return Align(
                      alignment: isCoach ? Alignment.centerLeft : Alignment.centerRight,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        padding: const EdgeInsets.all(14),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                        decoration: BoxDecoration(
                          color: isCoach
                              ? (isDark ? AppColors.darkCardElevated : AppColors.lightCard)
                              : AppColors.primaryAmber,
                          borderRadius: BorderRadius.circular(18),
                          border: isCoach
                              ? Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder)
                              : null,
                        ),
                        child: Text(
                          msg.text,
                          style: TextStyle(
                            fontSize: 14,
                            color: isCoach
                                ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                                : Colors.black,
                            fontWeight: isCoach ? FontWeight.normal : FontWeight.w600,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              if (state.isThinking)
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryAmber)),
                      SizedBox(width: 8),
                      Text('Torvex AI calculating biomechanics...', style: TextStyle(fontSize: 12, color: AppColors.primaryAmber)),
                    ],
                  ),
                ),
              // Quick Prompt chips
              SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _quickPrompts.length,
                  itemBuilder: (ctx, i) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ActionChip(
                        label: Text(_quickPrompts[i], style: const TextStyle(fontSize: 11)),
                        backgroundColor: isDark ? AppColors.darkCard : AppColors.lightCard,
                        onPressed: () {
                          context.read<CoachBloc>().add(SendCoachMessageEvent(_quickPrompts[i]));
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              // Input bar
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCardElevated : AppColors.lightCard,
                  border: Border(top: BorderSide(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _msgController,
                        decoration: InputDecoration(
                          hintText: 'Ask coach about routine, form, or diet...',
                          filled: true,
                          fillColor: isDark ? AppColors.darkCard : AppColors.lightBg,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(20),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        onSubmitted: (val) {
                          if (val.trim().isNotEmpty) {
                            context.read<CoachBloc>().add(SendCoachMessageEvent(val.trim()));
                            _msgController.clear();
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.send_rounded, color: AppColors.primaryAmber),
                      onPressed: () {
                        if (_msgController.text.trim().isNotEmpty) {
                          context.read<CoachBloc>().add(SendCoachMessageEvent(_msgController.text.trim()));
                          _msgController.clear();
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
