// Unused currently but will be in the future
import type { Issue } from "./types/Issue";

export const date = (val: string) => false;
export const time = (val: string) => false;

export function aba(val: string | number): Issue[] {
  const routNum = val.toString().trim();
  const issues: Issue[] = [];

  if (!/^[0-9]{9}$/.test(routNum)) {
    issues.push({
      message: "should be 9 digits long and only digits",
      level: "NACHA",
      value: val,
    });
    return issues;
  }

  if (!isRoutingInRange(routNum)) {
    issues.push({
      message: "First 2 digits ABA routing not within valid ranges",
      level: "NACHA",
      value: val,
    });
  }

  if (!isCheckDigitValid(routNum)) {
    issues.push({
      message: "check digit is invalid",
      level: "NACHA",
      value: val,
    });
  }
  return issues;
}

export function dfi(val: string | number): Issue[] {
  const dfiNum = val.toString().trim();
  const issues: Issue[] = [];

  if (!/^[0-9]{8}$/.test(dfiNum)) {
    issues.push({
      message: "should be 8 digits long and only digits",
      level: "NACHA",
      value: val,
    });
    return issues;
  }

  if (!isRoutingInRange(dfiNum)) {
    issues.push({
      message: "First 2 digits ABA routing not within valid ranges",
      level: "NACHA",
      value: val,
    });
  }
  return issues;
}

function isCheckDigitValid(rtn: string): boolean {
  const d = rtn.split("").map(Number);
  return (
    (3 * (d[0] + d[3] + d[6]) +
      7 * (d[1] + d[4] + d[7]) +
      1 * (d[2] + d[5] + d[8])) %
      10 ===
    0
  );
}

function isRoutingInRange(val: string): boolean {
  const firstTwoDigits = Number(val.slice(0, 2));
  return (
    firstTwoDigits === 80 ||
    isNumberInRanges(firstTwoDigits, [0, 12], [21, 32], [61, 72])
  );
}

function isNumberInRanges(num: number, ...ranges: [number, number][]): boolean {
  return ranges.some(([lo, hi]) => num >= lo && num <= hi);
}
