// Level configurations for the math game
export const LEVELS = [
  { level: 1, name: "Tiny Additions", operation: "+", min: 1, max: 5, problems: 5, description: "Add numbers up to 5" },
  { level: 2, name: "Bigger Additions", operation: "+", min: 1, max: 10, problems: 6, description: "Add numbers up to 10" },
  { level: 3, name: "Easy Subtraction", operation: "-", min: 1, max: 10, problems: 6, description: "Subtract numbers up to 10" },
  { level: 4, name: "Addition Pro", operation: "+", min: 5, max: 20, problems: 7, description: "Add bigger numbers" },
  { level: 5, name: "Subtraction Pro", operation: "-", min: 5, max: 20, problems: 7, description: "Subtract bigger numbers" },
  { level: 6, name: "Mix It Up", operation: "+-", min: 1, max: 15, problems: 8, description: "Addition & subtraction" },
  { level: 7, name: "Times Tables", operation: "×", min: 1, max: 5, problems: 8, description: "Multiply up to 5" },
  { level: 8, name: "Big Times", operation: "×", min: 2, max: 10, problems: 8, description: "Multiply up to 10" },
  { level: 9, name: "Math Mix", operation: "+-×", min: 1, max: 12, problems: 10, description: "All operations mixed" },
  { level: 10, name: "Math Champion", operation: "+-×", min: 5, max: 20, problems: 10, description: "The ultimate challenge" },
];

export const BADGES = [
  { id: "first_star", name: "First Star", icon: "⭐", description: "Earn your first star", check: (p) => p.total_stars >= 1 },
  { id: "five_stars", name: "Star Collector", icon: "🌟", description: "Earn 5 stars", check: (p) => p.total_stars >= 5 },
  { id: "ten_stars", name: "Star Master", icon: "💫", description: "Earn 10 stars", check: (p) => p.total_stars >= 10 },
  { id: "twenty_stars", name: "Superstar", icon: "✨", description: "Earn 20 stars", check: (p) => p.total_stars >= 20 },
  { id: "streak_3", name: "On Fire", icon: "🔥", description: "3 correct in a row", check: (p) => p.best_streak >= 3 },
  { id: "streak_5", name: "Unstoppable", icon: "💪", description: "5 correct in a row", check: (p) => p.best_streak >= 5 },
  { id: "streak_10", name: "Genius", icon: "🧠", description: "10 correct in a row", check: (p) => p.best_streak >= 10 },
  { id: "problems_10", name: "Problem Solver", icon: "🎯", description: "Solve 10 problems", check: (p) => p.problems_solved >= 10 },
  { id: "problems_50", name: "Math Whiz", icon: "🚀", description: "Solve 50 problems", check: (p) => p.problems_solved >= 50 },
  { id: "problems_100", name: "Math Legend", icon: "👑", description: "Solve 100 problems", check: (p) => p.problems_solved >= 100 },
  { id: "level_5", name: "Halfway There", icon: "🏔️", description: "Reach level 5", check: (p) => p.current_level >= 5 },
  { id: "level_10", name: "Champion", icon: "🏆", description: "Complete all levels", check: (p) => (p.levels_completed || []).length >= 10 },
];

// Adaptive difficulty: scale max range by difficulty multiplier (0.5 = easier, 1.5 = harder)
export function generateProblem(level, difficultyMult = 1.0) {
  const config = LEVELS[level - 1];
  if (!config) return null;

  const operations = config.operation.split('');
  const op = operations[Math.floor(Math.random() * operations.length)];
  const scaledMax = Math.max(config.min + 1, Math.round(config.min + (config.max - config.min) * difficultyMult));

  let a, b, answer;

  if (op === '+') {
    a = Math.floor(Math.random() * (scaledMax - config.min + 1)) + config.min;
    b = Math.floor(Math.random() * (scaledMax - config.min + 1)) + config.min;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * (scaledMax - config.min + 1)) + config.min;
    b = Math.floor(Math.random() * (a - config.min + 1)) + config.min;
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  } else if (op === '×') {
    a = Math.floor(Math.random() * (scaledMax - config.min + 1)) + config.min;
    b = Math.floor(Math.random() * (scaledMax - config.min + 1)) + config.min;
    answer = a * b;
  }

  // Generate 3 wrong answers
  const wrongAnswers = new Set();
  while (wrongAnswers.size < 3) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + (offset === 0 ? 1 : offset);
    if (wrong !== answer && wrong >= 0) {
      wrongAnswers.add(wrong);
    }
  }

  const options = [...wrongAnswers, answer].sort(() => Math.random() - 0.5);

  return { a, b, op, answer, options };
}