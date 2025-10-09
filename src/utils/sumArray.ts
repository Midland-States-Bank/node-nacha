export function sumArray(numArr: number[]): number {
  return numArr.reduce((acc, curVal) => acc + curVal, 0);
}
