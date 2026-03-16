export function BountyDisplay({
  amount,
  year,
}: {
  amount: number;
  year?: number;
}) {
  const label = year != null ? `${year} current ace bounty` : "Current bounty";
  return (
    <div className="bounty-card rounded-xl border-2 border-accent p-8 text-center shadow-sm transition-all duration-300">
      <p className="text-sm font-medium uppercase tracking-wider text-foreground-muted transition-colors duration-300">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold text-accent transition-colors duration-300 sm:text-5xl">
        ${amount}
      </p>
    </div>
  );
}
