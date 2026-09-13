import React from 'react';
import { Shield, Terminal, ArrowUpRight, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'agreements' | 'detail' | 'negotiation' | 'activity';
  onNavigate: (tab: 'home' | 'agreements' | 'negotiation' | 'activity') => void;
  selectedAgreementId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, selectedAgreementId }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E1E28] bg-[#08080A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded border border-[#00FF66]/30 bg-[#00FF66]/10 flex items-center justify-center text-[#00FF66] font-mono font-bold text-sm tracking-tighter group-hover:border-[#00FF66] transition-colors">
              P
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-base font-bold tracking-wider text-[#F3F3F6]">POKA</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#848494] uppercase">
                Make promises programmable
              </div>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1E1E28]">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all ${
                currentTab === 'home'
                  ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              Command
            </button>
            <button
              onClick={() => onNavigate('agreements')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all ${
                currentTab === 'agreements' || currentTab === 'detail'
                  ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              Agreements
            </button>
            <button
              onClick={() => onNavigate('negotiation')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all flex items-center space-x-1.5 ${
                currentTab === 'negotiation'
                  ? 'bg-[#1E1E28] text-[#00FF66] border border-[#00FF66]/40'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              <Cpu className="w-3 h-3 text-[#00FF66]" />
              <span>Agent Negotiation</span>
            </button>
            <button
              onClick={() => onNavigate('activity')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all ${
                currentTab === 'activity'
                  ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              Settlement & Ledger
            </button>
          </nav>
        </div>

        {/* Right side: Celo Sepolia status & wallet */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-[#1E1E28] text-[11px] font-mono text-[#848494]">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]"></span>
            <span className="text-[#F3F3F6] font-medium">CELO SEPOLIA</span>
            <span className="text-[#505060]">#11142222</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#121217] border border-[#1E1E28] text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-[#00FF66]/80"></div>
            <span className="text-[#F3F3F6]">0x71C...49b</span>
            <span className="text-[#848494] hidden md:inline">| 1,420.50 CELO</span>
          </div>
        </div>
      </div>
    </header>
  );
};
