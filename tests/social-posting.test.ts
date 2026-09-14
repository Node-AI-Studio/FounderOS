import { describe, expect, test } from 'vitest';
import { postDaysFromPosts, postDaysWithFallback } from '@/lib/social-posting';
import type { SocialPost } from '@/lib/schemas';

const post = (over: Partial<SocialPost>): SocialPost => ({
  id: 'p',
  caption: 'c',
  mediaUrl: null,
  platforms: ['instagram'],
  status: 'published',
  scheduledFor: '2026-09-10T18:00:00Z',
  createdAt: '2026-09-09T10:00:00Z',
  ...over,
});

describe('postDaysFromPosts', () => {
  test('published posts become one day entry each, on the scheduled day', () => {
    expect(postDaysFromPosts([post({ platforms: ['instagram', 'youtube'] })])).toEqual([
      { date: '2026-09-10', platforms: ['instagram', 'youtube'] },
    ]);
  });
  test('falls back to the created day when there is no schedule', () => {
    expect(postDaysFromPosts([post({ scheduledFor: null })])[0].date).toBe('2026-09-09');
  });
  test('queued and failed posts are not posting activity', () => {
    expect(postDaysFromPosts([post({ status: 'queued' }), post({ status: 'failed' })])).toEqual([]);
  });
});

describe('postDaysWithFallback', () => {
  test('live history wins when present', () => {
    const live = [{ date: '2026-09-01', platforms: ['tiktok'] }];
    expect(postDaysWithFallback(live, [post({})])).toBe(live);
  });
  test('empty live history falls back to the seeded posts', () => {
    expect(postDaysWithFallback([], [post({})])).toHaveLength(1);
  });
});
