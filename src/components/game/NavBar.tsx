import { useGame } from '@/context/GameContext';
import { GameSection } from '@/types/game';
import { Map, Target, Users, Music, TrendingUp, User } from 'lucide-react';

const navItems: { id: GameSection; icon: typeof Map; label: string }[] = [
  { id: 'map', icon: Map, label: 'MAP' },
  { id: 'missions', icon: Target, label: 'MISSIONS' },
  { id: 'crew', icon: Users, label: 'CREW' },
  { id: 'studio', icon: Music, label: 'STUDIO' },
  { id: 'reputation', icon: TrendingUp, label: 'REP' },
  { id: 'profile', icon: User, label: 'PROFILE' },
];

export function NavBar() {
  const { state, dispatch } = useGame();

  return (
    <nav className="w-14 bg-card border-r border-border flex flex-col items-center py-4 gap-1 shrink-0">
      {navItems.map(item => {
        const active = state.activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => dispatch({ type: 'SET_SECTION', section: item.id })}
            className={`nav-icon group ${active ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-14 bg-card border border-border px-2 py-1 text-[10px] font-display opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
