import { prisma } from "@/lib/db";
import { getAllAceWins } from "@/lib/bounty";
import { isIncludedInBounty } from "@/lib/video";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Winners | Ace Bounty",
  description:
    "Ace bounty winners and how much each payout was (calendar-year rules).",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type WinnerTotal = {
  key: string;
  displayLabel: string;
  totalAmount: number;
  winCount: number;
};

export default async function WinnersPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
  });
  const videosForBounty = videos.filter(isIncludedInBounty);
  const aceWins = getAllAceWins(videosForBounty);

  const rollup = new Map<string, WinnerTotal>();
  for (const w of aceWins) {
    const key = w.winnerName?.trim()
      ? w.winnerName.trim().toLowerCase()
      : "__anonymous__";
    const label = w.winnerName?.trim() ? w.winnerName.trim() : "Anonymous";
    const prev = rollup.get(key);
    if (prev) {
      prev.totalAmount += w.amount;
      prev.winCount += 1;
    } else {
      rollup.set(key, {
        key,
        displayLabel: label,
        totalAmount: w.amount,
        winCount: 1,
      });
    }
  }

  const byWinnerDesc = [...rollup.values()].sort(
    (a, b) => b.totalAmount - a.totalAmount || b.winCount - a.winCount
  );

  const purseTotal = aceWins.reduce((s, w) => s + w.amount, 0);

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center px-8 py-8">
      <div className="w-full max-w-[1200px]">
        <h1 className="mb-2 text-3xl font-bold text-foreground transition-colors duration-300 [text-shadow:none] dark:[text-shadow:2px_2px_4px_rgba(0,0,0,0.2)]">
          Winners
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-foreground-muted">
          Only videos marked “include in bounty” are counted. Payouts follow the
          same calendar-year rules as the rest of the site: each qualifying
          video adds $10 until an ace wins the pot.
        </p>

        <div className="mb-10 flex flex-wrap gap-6 text-sm">
          <p className="rounded-lg border border-border-light bg-card-bg px-4 py-3 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-black/40">
            <span className="text-foreground-muted">Total payouts</span>{" "}
            <span className="font-semibold tabular-nums text-foreground">
              ${purseTotal}
            </span>
          </p>
          <p className="rounded-lg border border-border-light bg-card-bg px-4 py-3 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-black/40">
            <span className="text-foreground-muted">Ace wins counted</span>{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {aceWins.length}
            </span>
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr,minmax(220px,280px)]">
          <section>
            <h2 className="section-heading mb-4 text-xl">Every ace payout</h2>
            {aceWins.length === 0 ? (
              <p className="text-foreground-muted">
                No bounty aces recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border-light shadow-sm dark:border-white/10">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-light bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
                      <th className="px-4 py-3 font-semibold text-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3 font-semibold text-foreground">
                        Winner
                      </th>
                      <th className="px-4 py-3 font-semibold text-foreground">
                        Year
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">
                        Won
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aceWins.map((w) => (
                      <tr
                        key={w.videoId}
                        className="border-b border-border-light last:border-0 dark:border-white/10"
                      >
                        <td className="px-4 py-3 text-foreground-muted">
                          {formatDate(w.publishedAt)}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {w.winnerName?.trim() || (
                            <span className="text-foreground-muted">
                              Anonymous
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-foreground-muted">
                          {w.year}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-accent">
                          ${w.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside>
            <h2 className="section-heading mb-4 text-xl">Totals by winner</h2>
            {byWinnerDesc.length === 0 ? (
              <p className="text-sm text-foreground-muted">—</p>
            ) : (
              <ol className="flex flex-col gap-2 rounded-xl border border-border-light bg-card-bg p-4 shadow-sm dark:border-white/10 dark:bg-black/40">
                {byWinnerDesc.map((row, i) => (
                  <li
                    key={row.key}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 text-foreground">
                      <span className="mr-2 font-medium text-foreground-muted">
                        {i + 1}.
                      </span>
                      {row.displayLabel}
                      {row.winCount > 1 ? (
                        <span className="text-foreground-muted">
                          {" "}
                          ({row.winCount}×)
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-accent">
                      ${row.totalAmount}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
