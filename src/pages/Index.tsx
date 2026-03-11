import { GameProvider } from '@/context/GameContext';
import { GameCanvas } from '@/components/game3d/GameCanvas';
import { GameHUD } from '@/components/game3d/GameHUD';
import { InteractionPanel } from '@/components/game3d/InteractionPanel';
import { DialoguePanel } from '@/components/game3d/DialoguePanel';
import { StorePanel } from '@/components/game3d/StorePanel';

const Index = () => (
  <GameProvider>
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <GameCanvas />
      <GameHUD />
      <InteractionPanel />
      <DialoguePanel />
      <StorePanel />
    </div>
  </GameProvider>
);

export default Index;
