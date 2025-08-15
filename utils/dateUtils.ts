export function getSmartDeadline(
  category: "today" | "week" | "month" | "later"
): Date | undefined {
  const now = new Date();

  switch (category) {
    case "today":
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);
      return endOfToday;

    case "week":
      const endOfWeek = new Date(now);
      // Calculate days until Saturday (6)
      const daysUntilSaturday = 6 - endOfWeek.getDay();
      endOfWeek.setDate(endOfWeek.getDate() + daysUntilSaturday);
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;

    case "month":
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return endOfMonth;

    case "later":
      return undefined; // No default deadline for "Later"

    default:
      return undefined;
  }
}

export function formatDeadlineForInput(date: Date): string {
  // Format for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
): (...args: T) => void {
  let timeout: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
