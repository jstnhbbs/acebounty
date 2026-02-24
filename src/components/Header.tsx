import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-white/10 bg-header-bg py-4 backdrop-blur-[10px] transition-all duration-300">
      <HeaderNav />
    </header>
  );
}
