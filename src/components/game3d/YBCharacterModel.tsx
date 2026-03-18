import { memo } from 'react';
import { CharacterDef } from '@/data/characters';
import { FaceCharacterModel } from './FaceCharacterModel';

interface YBCharacterModelProps {
  character: CharacterDef;
  isFollowing: boolean;
  relationship: number;
  currentRegion: 'city' | 'mountain' | 'bayou';
}

// YB: longest dreads in the game, 3 gold chains, all-black hoodie, white/red Jordans
export const YBCharacterModel = memo(function YBCharacterModel(props: YBCharacterModelProps) {
  return (
    <FaceCharacterModel
      {...props}
      texturePath="/yb.png"
      label="YB"
      dreadsCount={14}
      dreadsLength={0.65}
      chainCount={3}
      chainColor="#FFD700"
      jordanColor="#f8f8f8"
      jordanAccent="#cc1100"
    />
  );
});
