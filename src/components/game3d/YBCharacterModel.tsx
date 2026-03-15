import { memo } from 'react';
import { CharacterDef } from '@/data/characters';
import { FaceCharacterModel } from './FaceCharacterModel';

interface YBCharacterModelProps {
  character: CharacterDef;
  isFollowing: boolean;
  relationship: number;
  currentRegion: 'city' | 'mountain' | 'bayou';
}

// YB uses yb.png as his portrait — delegates to the shared FaceCharacterModel
export const YBCharacterModel = memo(function YBCharacterModel(props: YBCharacterModelProps) {
  return <FaceCharacterModel {...props} texturePath="/yb.png" label="YB" />;
});
