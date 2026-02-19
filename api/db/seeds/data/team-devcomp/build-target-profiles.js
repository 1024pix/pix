import { SCO_ORGANIZATION_ID } from '../common/constants.js';
import { PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';

export async function buildTargetProfiles({ databaseBuilder, organizationIds }) {
  const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
    id: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    imageUrl: 'https://images.pix.fr/profil-cible/Illu_GEN.svg',
    description: null,
    name: '[Pix+Édu 1D FC] Prêt pour la certification du volet 1',
    isSimplifiedAccess: false,
    category: 'PREDEFINED',
    areKnowledgeElementsResettable: true,
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

  _buildTargetProfileShares({
    databaseBuilder,
    organizationIds: [...organizationIds, SCO_ORGANIZATION_ID],
    targetProfileId,
  });
  await databaseBuilder.commit();
}

function _buildTargetProfileShares({ databaseBuilder, organizationIds, targetProfileId }) {
  organizationIds.forEach((organizationId) => {
    databaseBuilder.factory.buildTargetProfileShare({
      targetProfileId,
      organizationId,
    });
  });
}
