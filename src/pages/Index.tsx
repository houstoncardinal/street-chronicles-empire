import { GameProvider, useGame } from '@/context/GameContext';
import { HUD } from '@/components/game/HUD';
import { NavBar } from '@/components/game/NavBar';
import { WorldMap } from '@/components/game/WorldMap';
import { Missions } from '@/components/game/Missions';
import { Crew } from '@/components/game/Crew';
import { MusicStudio } from '@/components/game/MusicStudio';
import { Reputation } from '@/components/game/Reputation';
import { PlayerProfile } from '@/components/game/PlayerProfile';
import { AnimatePresence, motion } from 'framer-motion';

function GameContent() {
  const { state } = useGame();

  const sections: Record<string, React.ReactNode> = {
    map: <WorldMap />,
    missions: <Missions />,
    crew: <Crew />,
    studio: <MusicStudio />,
    reputation: <Reputation />,
    profile: <PlayerProfile />,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <HUD />
      <div className="flex flex-1 overflow-hidden">
        <NavBar />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {sections[state.activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const Index = () => (
  <GameProvider>
    <GameContent />
  </GameProvider>
);

export default Index;
