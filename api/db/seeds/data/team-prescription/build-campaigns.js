import { SCO_ORGANIZATION_ID, SCO_ORGANIZATION_USER_ID } from './constants.js';

function _createScoCampaigns(databaseBuilder) {
  databaseBuilder.factory.buildCampaign({
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: "Campagne d'évaluation SCO",
  });
  databaseBuilder.factory.buildCampaign({
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO - envoi simple',
    type: 'PROFILES_COLLECTION',
    title: null,
  });
  databaseBuilder.factory.buildCampaign({
    organizationId: SCO_ORGANIZATION_ID,
    ownerId: SCO_ORGANIZATION_USER_ID,
    name: 'Campagne de collecte de profil SCO - envoi multiple',
    type: 'PROFILES_COLLECTION',
    title: null,
    multipleSendings: true,
  });
}

export function buildCampaigns(databaseBuilder) {
  _createScoCampaigns(databaseBuilder);
}
