import type { SocialPost } from '@/lib/schemas';
import type { ZernioPostDay } from '@/lib/connectors/zernio';

/**
 * Per-post {date, platforms} from the app's own post table, for the posting
 * consistency strip. Only published posts count; a queued or failed post never
 * happened on the feed. The day is the scheduled slot when there is one, else
 * the day the post was created.
 */
export function postDaysFromPosts(posts: SocialPost[]): ZernioPostDay[] {
  return posts
    .filter((p) => p.status === 'published')
    .map((p) => ({ date: (p.scheduledFor ?? p.createdAt).slice(0, 10), platforms: [...p.platforms] }))
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date));
}

/** Live Zernio history when it has any, else the app's own published posts. */
export function postDaysWithFallback(live: ZernioPostDay[], posts: SocialPost[]): ZernioPostDay[] {
  return live.length > 0 ? live : postDaysFromPosts(posts);
}
