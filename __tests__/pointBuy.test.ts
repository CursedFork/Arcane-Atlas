import { describe, it, expect } from "vitest";
import {
  scoreCost,
  pointsSpent,
  pointsRemaining,
  isValidPointBuy,
  canIncrement,
  canDecrement,
  STANDARD_ARRAY,
  POINT_BUY_TOTAL,
} from "@/lib/pointBuy";

// The functions operate on number[] (ordered ability score values)
// Using a consistent 6-value array matching ABILITY_KEYS order
const allEights = [8, 8, 8, 8, 8, 8];

describe("scoreCost", () => {
  it("returns 0 for score 8", () => {
    expect(scoreCost(8)).toBe(0);
  });

  it("returns 1 for score 9", () => {
    expect(scoreCost(9)).toBe(1);
  });

  it("returns 7 for score 14", () => {
    expect(scoreCost(14)).toBe(7);
  });

  it("returns 9 for score 15", () => {
    expect(scoreCost(15)).toBe(9);
  });

  it("returns 0 for score below 8 (no entry → 0 via nullish coalescing)", () => {
    expect(scoreCost(7)).toBe(0);
  });

  it("returns 0 for score above 15 (no entry)", () => {
    expect(scoreCost(16)).toBe(0);
  });
});

describe("pointsSpent", () => {
  it("returns 0 when all scores are 8", () => {
    expect(pointsSpent(allEights)).toBe(0);
  });

  it("correctly sums mixed scores", () => {
    // 15 costs 9, 14 costs 7, rest 8=0
    expect(pointsSpent([15, 14, 8, 8, 8, 8])).toBe(9 + 7);
  });

  it("sums a realistic build", () => {
    // 15(9) + 14(7) + 13(5) = 21
    expect(pointsSpent([15, 14, 13, 8, 8, 8])).toBe(21);
  });
});

describe("pointsRemaining", () => {
  it("returns 27 when all scores are 8", () => {
    expect(pointsRemaining(allEights)).toBe(27);
  });

  it("returns 0 after spending exactly 27 points", () => {
    // 15+14+13 = 9+7+5 = 21, need 6 more for two 12s (12=4 pts each = 8)
    // 15(9) + 14(7) + 11(3) + 10(2) + 10(2) + 10(2) = 25; needs tweaking
    // Actually: 15(9)+14(7)+13(5)+8+8+8 = 21; remaining=6
    // 15(9)+14(7)+13(5)+11(3)+10(2)+9(1) = 27; remaining=0
    expect(pointsRemaining([15, 14, 13, 11, 10, 9])).toBe(0);
  });
});

describe("isValidPointBuy", () => {
  it("accepts all-8s build", () => {
    expect(isValidPointBuy(allEights)).toBe(true);
  });

  it("accepts a valid 27-point build", () => {
    // 15+14+13+11+10+9 = 9+7+5+3+2+1 = 27
    expect(isValidPointBuy([15, 14, 13, 11, 10, 9])).toBe(true);
  });

  it("rejects build that spends over 27 points", () => {
    // 15+15+15+15+8+8 = 9+9+9+9 = 36 > 27
    expect(isValidPointBuy([15, 15, 15, 15, 8, 8])).toBe(false);
  });

  it("rejects scores below 8", () => {
    expect(isValidPointBuy([7, 8, 8, 8, 8, 8])).toBe(false);
  });

  it("rejects scores above 15", () => {
    expect(isValidPointBuy([16, 8, 8, 8, 8, 8])).toBe(false);
  });
});

describe("canIncrement", () => {
  it("allows increment from 8 when 0 points are spent", () => {
    // spent=0, incrementing 8→9 costs 1; 0+1<=27 → true
    expect(canIncrement(8, 0)).toBe(true);
  });

  it("prevents increment when score is 15", () => {
    expect(canIncrement(15, 0)).toBe(false);
  });

  it("prevents increment when additional cost exceeds budget", () => {
    // Going from 14→15 costs 2 more points (scoreCost(15)-scoreCost(14) = 9-7 = 2)
    // If 26 points are already spent: 26+2=28 > 27 → false
    expect(canIncrement(14, 26)).toBe(false);
  });

  it("allows increment when budget remains", () => {
    // Going from 14→15 costs 2 more; spent=25: 25+2=27 <= 27 → true
    expect(canIncrement(14, 25)).toBe(true);
  });
});

describe("canDecrement", () => {
  it("allows decrement when score is above 8", () => {
    expect(canDecrement(10)).toBe(true);
  });

  it("prevents decrement when score is already 8", () => {
    expect(canDecrement(8)).toBe(false);
  });
});

describe("STANDARD_ARRAY", () => {
  it("has 6 values", () => {
    expect(STANDARD_ARRAY).toHaveLength(6);
  });

  it("contains [15, 14, 13, 12, 10, 8]", () => {
    expect([...STANDARD_ARRAY]).toEqual([15, 14, 13, 12, 10, 8]);
  });
});

describe("POINT_BUY_TOTAL", () => {
  it("equals 27", () => {
    expect(POINT_BUY_TOTAL).toBe(27);
  });
});
