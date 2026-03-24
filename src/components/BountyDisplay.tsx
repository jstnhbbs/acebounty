export function BountyDisplay({
  amount,
  year,
}: {
  amount: number;
  year?: number;
}) {
  const label =
    year != null ? `${year} ace bounty` : "Ace bounty";
  const asOf = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="bounty-card rounded-xl border-2 border-accent p-8 text-center shadow-sm transition-all duration-300">
      <p className="text-lg font-medium uppercase tracking-wider text-foreground-muted transition-colors duration-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-normal normal-case tracking-normal text-foreground-muted transition-colors duration-300">
        (as of {asOf})
      </p>
      <p className="mt-2 text-4xl font-bold text-accent transition-colors duration-300 sm:text-5xl">
        ${amount}
      </p>
    </div>
  );
}
