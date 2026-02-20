export function BountyDisplay({
  amount,
  year,
}: {
  amount: number;
  year?: number;
}) {
  const label = year != null ? `${year}  ace bounty` : "Current bounty";
  return (
    <div className="bounty-card rounded-xl border-2 border-[#B79953] p-8 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300">
      <p className="text-sm font-medium uppercase tracking-wider text-[#666] transition-colors duration-300 dark:text-[#b0b0b0]">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold text-[#B79953] transition-colors duration-300 sm:text-5xl dark:text-[#B79953]">
        ${amount}
      </p>
    </div>
  );
}
