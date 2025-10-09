export function toYYMMDD<T extends Date | undefined>(
  date: T
): T extends Date ? string : undefined;
export function toYYMMDD(date?: Date) {
  if (date === undefined) return undefined;

  const year = String(date.getFullYear() % 100).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function parseYYMMDD<T extends string | undefined>(
  dateStr: T,
  timeStr?: string
): T extends string ? Date : undefined;
export function parseYYMMDD(dateStr?: string, timeStr?: string) {
  if (!dateStr) return undefined;
  if (!/^\d{6}$/.test(dateStr)) {
    throw new Error(`Invalid date format. Expected YYMMDD. Received ${dateStr}`);
  }

  if (timeStr && !/^\d{4}$/.test(timeStr)) {
    throw new Error("Invalid time format. Expected HHMM.");
  }

  const currentDate = new Date();
  const currentCentury =
    currentDate.getFullYear() - (currentDate.getFullYear() % 100);
  const year = Number(dateStr.slice(0, 2));
  const month = Number(dateStr.slice(2, 4)) - 1; // JS months are 0-based
  const day = Number(dateStr.slice(4, 6));

  let parsedDate = new Date(currentCentury + year, month, day);

  if (timeStr) {
    // timeStr is expected to be HHMM
    if (!/^\d{4}$/.test(timeStr)) {
      throw new Error("Invalid time format. Expected HHMM.");
    }
    const hour = Number(timeStr.slice(0, 2));
    const minute = Number(timeStr.slice(2, 4));
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error("Invalid time values in timeStr");
    }

    parsedDate.setHours(hour, minute, 0, 0);
  } else {
    parsedDate.setHours(0, 0, 0, 0); // Set to start of day if no time provided
  }

  return parsedDate;
}

export function toHHMM<T extends Date | undefined>(
  date: T
): T extends Date ? string : undefined;
export function toHHMM(date?: Date): string | undefined {
  if (!date) return undefined;

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}${minutes}`;
}

export function getTomorrowsDate(date?: Date): Date {
  if (!date) date = new Date();
  let tomorrow = new Date(date);

  return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
}
