import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../bloc/workout/workout_bloc.dart';
import '../../bloc/workout/workout_event.dart';
import '../../bloc/workout/workout_state.dart';
import 'workout_detail_sheet.dart';

class WorkoutsScreen extends StatefulWidget {
  const WorkoutsScreen({Key? key}) : super(key: key);

  @override
  State<WorkoutsScreen> createState() => _WorkoutsScreenState();
}

class _WorkoutsScreenState extends State<WorkoutsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'All',
    'Full Body',
    'Upper Body',
    'Lower Body',
    'Strength',
    'Core',
  ];

  final List<String> _difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('WORKOUT LIBRARY', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -0.5)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryAmber,
          labelColor: AppColors.primaryAmber,
          unselectedLabelColor: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
          tabs: const [
            Tab(text: 'TRAINING ROUTINES'),
            Tab(text: 'EXERCISE DIRECTORY'),
          ],
        ),
      ),
      body: BlocBuilder<WorkoutBloc, WorkoutState>(
        builder: (context, state) {
          return TabBarView(
            controller: _tabController,
            children: [
              // TAB 1: Workouts
              Column(
                children: [
                  // Search & Filter controls
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search workouts, muscles, equipment...',
                        prefixIcon: const Icon(Icons.search, size: 20),
                        filled: true,
                        fillColor: isDark ? AppColors.darkCard : AppColors.lightCard,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
                        ),
                      ),
                      onChanged: (val) {
                        context.read<WorkoutBloc>().add(FilterWorkoutsEvent(
                          category: state.selectedCategory,
                          difficulty: state.selectedDifficulty,
                          onlyFavorites: state.onlyFavorites,
                          searchQuery: val,
                        ));
                      },
                    ),
                  ),
                  // Categories Chips
                  SizedBox(
                    height: 40,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _categories.length,
                      itemBuilder: (ctx, i) {
                        final cat = _categories[i];
                        final isSelected = state.selectedCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(cat, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                            selected: isSelected,
                            selectedColor: AppColors.primaryAmber,
                            onSelected: (_) {
                              context.read<WorkoutBloc>().add(FilterWorkoutsEvent(
                                category: cat,
                                difficulty: state.selectedDifficulty,
                                onlyFavorites: state.onlyFavorites,
                                searchQuery: state.searchQuery,
                              ));
                            },
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Workouts List
                  Expanded(
                    child: state.filteredWorkouts.isEmpty
                        ? const Center(child: Text('No routines match criteria'))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: state.filteredWorkouts.length,
                            itemBuilder: (ctx, i) {
                              final w = state.filteredWorkouts[i];
                              final isFav = state.favoriteIds.contains(w.workoutId);

                              return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  color: isDark ? AppColors.darkCard : AppColors.lightCard,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
                                ),
                                child: InkWell(
                                  onTap: () => WorkoutDetailSheet.show(context, w),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Stack(
                                        children: [
                                          ClipRRect(
                                            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                                            child: CachedNetworkImage(
                                              imageUrl: w.imageUrl,
                                              height: 170,
                                              width: double.infinity,
                                              fit: BoxFit.cover,
                                              placeholder: (_, __) => Container(color: Colors.black26),
                                            ),
                                          ),
                                          Positioned(
                                            top: 12,
                                            right: 12,
                                            child: IconButton(
                                              style: IconButton.styleFrom(backgroundColor: Colors.black54),
                                              icon: Icon(
                                                isFav ? Icons.favorite : Icons.favorite_border,
                                                color: isFav ? AppColors.rose : Colors.white,
                                              ),
                                              onPressed: () {
                                                context.read<WorkoutBloc>().add(ToggleFavoriteWorkoutEvent(w.workoutId));
                                              },
                                            ),
                                          ),
                                          if (w.isPremiumOnly)
                                            Positioned(
                                              top: 12,
                                              left: 12,
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: Colors.black87,
                                                  borderRadius: BorderRadius.circular(6),
                                                  border: Border.all(color: AppColors.primaryAmber),
                                                ),
                                                child: Row(
                                                  children: const [
                                                    Icon(Icons.lock, size: 12, color: AppColors.primaryAmber),
                                                    SizedBox(width: 4),
                                                    Text('PRO', style: TextStyle(color: AppColors.primaryAmber, fontSize: 10, fontWeight: FontWeight.bold)),
                                                  ],
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(w.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                                            const SizedBox(height: 6),
                                            Text(
                                              w.description,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                              ),
                                            ),
                                            const SizedBox(height: 12),
                                            Row(
                                              children: [
                                                const Icon(Icons.schedule, size: 14, color: AppColors.primaryAmber),
                                                const SizedBox(width: 4),
                                                Text('${w.durationMinutes} min', style: const TextStyle(fontSize: 12)),
                                                const SizedBox(width: 12),
                                                const Icon(Icons.fitness_center, size: 14, color: AppColors.primaryAmber),
                                                const SizedBox(width: 4),
                                                Text('${w.exerciseCount} exercises', style: const TextStyle(fontSize: 12)),
                                                const Spacer(),
                                                Text(w.difficulty, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryAmber)),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
              // TAB 2: Exercise Library
              ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.exerciseLibrary.length,
                itemBuilder: (ctx, i) {
                  final ex = state.exerciseLibrary[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkCard : AppColors.lightCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? AppColors.darkCardBorder : AppColors.lightCardBorder),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CachedNetworkImage(
                            imageUrl: ex.imageUrl,
                            width: 70,
                            height: 70,
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(color: Colors.black26),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(ex.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(
                                ex.targetMuscles.join(', '),
                                style: const TextStyle(fontSize: 12, color: AppColors.primaryAmber),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                ex.instructions.isNotEmpty ? ex.instructions.first : ex.tips,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
