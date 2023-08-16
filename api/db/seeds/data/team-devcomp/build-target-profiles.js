import { PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';

export function buildTargetProfiles(databaseBuilder) {
  databaseBuilder.factory.buildTargetProfile({
    id: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    imageUrl: null,
    description: null,
    name: '[Pix+Édu 1D FC] Prêt pour la certification du volet 1',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    isPublic: true,
  });
  [
    { tubeId: 'tube2l7fFnDh1vPn4s', level: 5 },
    { tubeId: 'tube1NLpOetQhutFlA', level: 2 },
    { tubeId: 'tube1fUwkP4nkSMt3H', level: 2 },
  ].map(({ tubeId, level }) => {
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
      tubeId,
      level,
    });
  });
}
