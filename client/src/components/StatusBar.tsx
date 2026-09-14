import React from 'react';
import { SentinelStatus } from '@poka/shared';
import { ShieldCheck, Activity, Cpu, Layers } from 'lucide-react';

interface StatusBarProps {
  status: SentinelStatus | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const activeSentinels = status?.activeSentinelsCount ?? 4;
  const totalEscrow = status?.totalInEscrow ?? 3450;
  const syncStatus = status?.status ?? 'SYNCED';
  const network = status?.network === 'CELO_SEPOLIA' ? 'CELO SEPOLIA' : 'CELO SEPOLIA (SANDBOX)';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1E1E28] bg-[#08080A]/95 backdrop-blur-md py-2 px-4 text-[11px] font-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center space-x-6 text-[#848494]">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span>ACTIVE SENTINELS:</span>
            <span className="text-[#F3F3F6] font-semibold">{String(activeSentinels).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Layers className="w-3 h-3 text-[#505060]" />
            <span>TOTAL IN ESCROW:</span>
            <span className="text-[#00FF66] font-semibold">
              ${totalEscrow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5">
            <Cpu className="w-3 h-3 text-[#505060]" />
            <span>SETTLEMENT:</span>
            <span className="text-[#F3F3F6] font-semibold">{network}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[#848494]">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#505060]">ATTRIBUTION:</span>
            <span className="text-[#848494] bg-[#121217] px-1.5 py-0.5 rounded border border-[#1E1E28] text-[10px]">
              celo_fb00f20ea4e8
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>STATUS:</span>
            <span className="text-[#00FF66] font-bold tracking-wider">{syncStatus}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
