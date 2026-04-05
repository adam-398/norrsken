export function auroraMessage(kPIndex: number): string {
  if (kPIndex >= 0 && kPIndex <= 2) {
    return "Aurora unlikely";
  } else if (kPIndex >= 3 && kPIndex <= 4) {
    return "Aurora possible";
  } else if (kPIndex >= 5) {
    return "Aurora likely";
  } else {
    return "Invalid K-Index value";
  }
}
