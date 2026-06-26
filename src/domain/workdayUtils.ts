function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isWorkday(
  date: Date,
  holidays: string[],
  workdays: number[],
): boolean {
  return workdays.includes(date.getDay()) && !holidays.includes(toLocalDateString(date));
}

export function isLastWorkdayOfWeek(
  date: Date,
  holidays: string[],
  workdays: number[],
): boolean {
  if (!isWorkday(date, holidays, workdays)) return false;

  const candidate = new Date(date);
  for (let offset = 1; offset <= 7; offset += 1) {
    candidate.setDate(date.getDate() + offset);
    if (candidate.getDay() === 1) return true;
    if (isWorkday(candidate, holidays, workdays)) return false;
  }
  return true;
}
