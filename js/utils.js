export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getExerciseContainer(instance) {
  return (
    instance.container ||
    document.getElementById("exercise-container") ||
    document.getElementById("main-container")
  );
}

export function clampPercent(value, cap) {
  return Math.min(Math.round((value / cap) * 100), 100);
}
