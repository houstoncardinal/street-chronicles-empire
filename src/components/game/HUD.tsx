import { useGame } from '@/context/GameContext';
import { DollarSign, Users, Star } from 'lucide-react';

export function HUD() {
  const { state } = useGame();

  return (
    <div className="h-10 bg-card border-b border-border flex items-center px-4 gap-6 text-xs font-mono shrink-0">
      <span className="font-display text-sm tracking-wider text-primary glow-text-pink">NBA</span>

      <div className="flex items-center gap-1.5 text-foreground">
        <DollarSign className="w-3 h-3 text-primary" />
        <span>${state.money.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-1.5 text-foreground">
        <Users className="w-3 h-3 text-primary" />
        <span>{state.fans.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-1.5 text-foreground">
        <Star className="w-3 h-3 text-primary" />
        <span>LVL {state.level}</span>
      </div>

      <div className="hidden sm:flex items-center gap-4 ml-auto">
        <HudMeter label="STREET" value={state.streetRep} />
        <HudMeter label="FAME" value={state.industryFame} />
        <HudMeter label="LOYALTY" value={state.crewLoyalty} />
      </div>
    </div>
  );
}

function HudMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-[10px]">{label}</span>
      <div className="w-16 h-1 bg-secondary">
        <div
          className="h-full neon-line transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] w-6 text-right">{value}</span>
    </div>
  );
}
