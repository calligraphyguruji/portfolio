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
const CACHE_KEY = `leetcode_stats_v2_${USERNAME}`;
const CACHE_TIME_KEY = `leetcode_stats_time_v2_${USERNAME}`;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to prevent rate-limiting while keeping it fresh

// Fallback baseline from verified live profile as of September 2026
const BASELINE_STATS = {
  totalSolved: 193,
  easySolved: 42,
  mediumSolved: 130,
  hardSolved: 21,
  ranking: 895616,
};

export function useLeetCodeStats() {
  const [stats, setStats] = useState<LeetCodeStats>(() => {
    // Try restoring from localStorage first for instant, layout-shift-free rendering
    if (typeof window !== 'undefined') {
      try {
        // Clean up legacy cache key without dynamic ranking
        localStorage.removeItem(`leetcode_stats_${USERNAME}`);
        localStorage.removeItem(`leetcode_stats_time_${USERNAME}`);
      } catch {
        // ignore
      }

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.ranking && parsed.totalSolved) {
            return {
              totalSolved: parsed.totalSolved,
              easySolved: parsed.easySolved ?? BASELINE_STATS.easySolved,
              mediumSolved: parsed.mediumSolved ?? BASELINE_STATS.mediumSolved,
              hardSolved: parsed.hardSolved ?? BASELINE_STATS.hardSolved,
              ranking: parsed.ranking,
              loading: false,
              error: false,
              syncedLive: true,
            };
          }
        }
      } catch {
        // ignore storage parse error
      }
    }

    return {
      ...BASELINE_STATS,
      loading: true,
      error: false,
      syncedLive: false,
    };
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      // Check if recent cache exists and contains valid dynamic rank
      try {
        const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (lastFetch && cachedData && Date.now() - Number(lastFetch) < CACHE_TTL_MS) {
          const parsed = JSON.parse(cachedData);
          if (parsed.ranking && parsed.totalSolved) {
            if (isMounted) {
              setStats({
                totalSolved: parsed.totalSolved,
                easySolved: parsed.easySolved ?? BASELINE_STATS.easySolved,
                mediumSolved: parsed.mediumSolved ?? BASELINE_STATS.mediumSolved,
                hardSolved: parsed.hardSolved ?? BASELINE_STATS.hardSolved,
                ranking: parsed.ranking,
                loading: false,
                error: false,
                syncedLive: true,
              });
            }
            return;
          }
        }
      } catch {
        // proceed to fetch
      }

      // Step 1: Candidate API endpoints that provide BOTH full solved metrics AND live ranking
      const fullProfileEndpoints = [
        `https://alfa-leetcode-api.onrender.com/userProfile/${USERNAME}`,
        `https://leetcode-api-faisalshohag.vercel.app/${USERNAME}`,
      ];

      for (const url of fullProfileEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) continue;

          const data = await response.json();

          const total = Number(data.totalSolved ?? data.solvedProblem);
          const rank = data.ranking ? Number(data.ranking) : null;

          if (!isNaN(total) && total > 0 && rank !== null) {
            const easy = Number(data.easySolved ?? 0);
            const medium = Number(data.mediumSolved ?? 0);
            const hard = Number(data.hardSolved ?? 0);

            const newStats: LeetCodeStats = {
              totalSolved: total,
              easySolved: easy || BASELINE_STATS.easySolved,
              mediumSolved: medium || BASELINE_STATS.mediumSolved,
              hardSolved: hard || BASELINE_STATS.hardSolved,
              ranking: rank,
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
          // try next endpoint
          continue;
        }
      }

      // Step 2: Fallback — query solved metrics and profile info in parallel and merge
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const [solvedRes, profileRes] = await Promise.allSettled([
          fetch(`https://alfa-leetcode-api.onrender.com/${USERNAME}/solved`, { signal: controller.signal }),
          fetch(`https://alfa-leetcode-api.onrender.com/${USERNAME}`, { signal: controller.signal }),
        ]);
        clearTimeout(timeoutId);

        let total = 0;
        let easy = 0;
        let medium = 0;
        let hard = 0;
        let rank: number | null = null;

        if (solvedRes.status === 'fulfilled' && solvedRes.value.ok) {
          const solvedData = await solvedRes.value.json();
          total = Number(solvedData.solvedProblem ?? solvedData.totalSolved ?? 0);
          easy = Number(solvedData.easySolved ?? 0);
          medium = Number(solvedData.mediumSolved ?? 0);
          hard = Number(solvedData.hardSolved ?? 0);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const profileData = await profileRes.value.json();
          if (profileData.ranking) {
            rank = Number(profileData.ranking);
          }
        }

        if (total > 0 || rank !== null) {
          const newStats: LeetCodeStats = {
            totalSolved: total || BASELINE_STATS.totalSolved,
            easySolved: easy || BASELINE_STATS.easySolved,
            mediumSolved: medium || BASELINE_STATS.mediumSolved,
            hardSolved: hard || BASELINE_STATS.hardSolved,
            ranking: rank ?? BASELINE_STATS.ranking,
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
          return;
        }
      } catch {
        // ignore fallback error
      }

      // Step 3: If all live network fetches fail, mark fallback without crashing
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
