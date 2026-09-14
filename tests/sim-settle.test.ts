import { describe, expect, test } from 'vitest';
import { createSettleDetector } from '@/lib/sim-settle';

const still = [{ vx: 0.001, vy: -0.002 }, { vx: 0, vy: 0 }];
const moving = [{ vx: 0.001, vy: 0 }, { vx: 0.4, vy: 0.1 }];

describe('createSettleDetector', () => {
  test('fires only after the sim is cool and every node has been quiet for N ticks', () => {
    const settled = createSettleDetector({ maxSpeed: 0.05, maxAlpha: 0.12, quietTicks: 3 });
    expect(settled(still, 0.3)).toBe(false); // still hot
    expect(settled(still, 0.1)).toBe(false); // quiet tick 1
    expect(settled(still, 0.1)).toBe(false); // quiet tick 2
    expect(settled(still, 0.1)).toBe(true); // quiet tick 3
  });

  test('any moving node resets the quiet streak', () => {
    const settled = createSettleDetector({ maxSpeed: 0.05, maxAlpha: 0.12, quietTicks: 2 });
    expect(settled(still, 0.1)).toBe(false);
    expect(settled(moving, 0.1)).toBe(false);
    expect(settled(still, 0.1)).toBe(false);
    expect(settled(still, 0.1)).toBe(true);
  });

  test('a cold sim is settled even while nodes still creep', () => {
    const settled = createSettleDetector({ maxSpeed: 0.05, maxAlpha: 0.12, quietTicks: 8, minAlpha: 0.02 });
    expect(settled(moving, 0.05)).toBe(false);
    expect(settled(moving, 0.019)).toBe(true);
  });

  test('nodes without velocities count as quiet', () => {
    const settled = createSettleDetector({ maxSpeed: 0.05, maxAlpha: 0.12, quietTicks: 1 });
    expect(settled([{}, { vx: undefined, vy: undefined }], 0.05)).toBe(true);
  });
});
