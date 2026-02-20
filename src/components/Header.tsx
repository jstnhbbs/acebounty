import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-[rgba(183,153,83,0.3)] bg-[#2d2d2d] py-4 backdrop-blur-[10px] transition-all duration-300 [&[data-theme='dark']]:border-white/10">
      <HeaderNav />
    </header>
  );
}
