import { useState, useEffect } from 'react';

export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  loading: boolean;
  error: boolean;
  syncedLive: boolean;
}

const USERNAME = 'calligraphyguruji';
const CACHE_KEY = `leetcode_stats_${USERNAME}`;
const CACHE_TIME_KEY = `leetcode_stats_time_${USERNAME}`;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to prevent rate-limiting while keeping it fresh

// Fallback baseline from verified profile as of Sept 2026
const BASELINE_STATS = {
  totalSolved: 180,
  easySolved: 39,
  mediumSolved: 120,
  hardSolved: 21,
  ranking: 968474,
};

export function useLeetCodeStats() {
  const [stats, setStats] = useState<LeetCodeStats>(() => {
    // Try restoring from localStorage first for instant, layout-shift-free rendering
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            totalSolved: parsed.totalSolved ?? BASELINE_STATS.totalSolved,
            easySolved: parsed.easySolved ?? BASELINE_STATS.easySolved,
            mediumSolved: parsed.mediumSolved ?? BASELINE_STATS.mediumSolved,
            hardSolved: parsed.hardSolved ?? BASELINE_STATS.hardSolved,
            ranking: parsed.ranking ?? BASELINE_STATS.ranking,
            loading: false,
            error: false,
            syncedLive: true,
          };
        }
      } catch {
        // ignore storage parse error
      }
    }

    return {
      ...BASELINE_STATS,
      ranking: BASELINE_STATS.ranking,
      loading: true,
      error: false,
      syncedLive: false,
    };
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      // Check if recent cache exists
      try {
        const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (lastFetch && cachedData && Date.now() - Number(lastFetch) < CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (isMounted) {
            setStats({
              totalSolved: parsed.totalSolved,
              easySolved: parsed.easySolved,
              mediumSolved: parsed.mediumSolved,
              hardSolved: parsed.hardSolved,
              ranking: parsed.ranking,
              loading: false,
              error: false,
              syncedLive: true,
            });
          }
          return;
        }
      } catch {
        // proceed to fetch
      }

      // Candidate API endpoints with automated fallback
      const endpoints = [
        `https://alfa-leetcode-api.onrender.com/${USERNAME}/solved`,
        `https://leetcode-api-faisalshohag.vercel.app/${USERNAME}`,
        `https://alfa-leetcode-api.onrender.com/userProfile/${USERNAME}`,
      ];

      for (const url of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) continue;

          const data = await response.json();

          const total = Number(data.solvedProblem ?? data.totalSolved);
          if (!isNaN(total) && total > 0) {
            const easy = Number(data.easySolved ?? 0);
            const medium = Number(data.mediumSolved ?? 0);
            const hard = Number(data.hardSolved ?? 0);
            const rank = data.ranking ? Number(data.ranking) : null;

            const newStats: LeetCodeStats = {
              totalSolved: total,
              easySolved: easy || BASELINE_STATS.easySolved,
              mediumSolved: medium || BASELINE_STATS.mediumSolved,
              hardSolved: hard || BASELINE_STATS.hardSolved,
              ranking: rank || BASELINE_STATS.ranking,
              loading: false,
              error: false,
              syncedLive: true,
            };

            if (isMounted) {
              setStats(newStats);
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(newStats));
                localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
              } catch {
                // ignore quota
              }
            }
            return; // successfully fetched & set
          }
        } catch {
          // try next fallback endpoint
          continue;
        }
      }

      // If all live network fetches fail, mark fallback without crashing
      if (isMounted) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: true,
          syncedLive: false,
        }));
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return stats;
}
