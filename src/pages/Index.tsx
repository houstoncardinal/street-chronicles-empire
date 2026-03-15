import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { GameCanvas } from '@/components/game3d/GameCanvas';
import { GameHUD } from '@/components/game3d/GameHUD';
import { InteractionPanel } from '@/components/game3d/InteractionPanel';
import { DialoguePanel } from '@/components/game3d/DialoguePanel';
import { StorePanel } from '@/components/game3d/StorePanel';
import { MusicPlayerWidget } from '@/components/game3d/MusicPlayerWidget';
import { CharacterSelectScreen } from '@/components/game3d/CharacterSelectScreen';

function GameRoot() {
  const [characterChosen, setCharacterChosen] = useState(false);
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {!characterChosen ? (
        <CharacterSelectScreen onDone={() => setCharacterChosen(true)} />
      ) : (
        <>
          <GameCanvas />
          <GameHUD />
          <InteractionPanel />
          <DialoguePanel />
          <StorePanel />
          <MusicPlayerWidget />
        </>
      )}
    </div>
  );
}

const Index = () => (
  <GameProvider>
    <GameRoot />
  </GameProvider>
);

export default Index;
