import {
  PIX_EMPLOI_CLEA_BADGE_ID_V1,
  PIX_EMPLOI_CLEA_BADGE_ID_V2,
  PIX_EMPLOI_CLEA_BADGE_ID_V3,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID,
} from '../badges-builder';

import {
  CERTIF_REGULAR_USER1_ID,
  CERTIF_SUCCESS_USER_ID,
  CERTIF_FAILURE_USER_ID,
  CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
  CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
} from './users';

import { participateToAssessmentCampaign } from '../campaign-participations-builder';

import {
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2,
  TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
} from '../target-profiles-builder';

import { PRO_COMPANY_ID, PRO_LEARNER_ASSOCIATED_ID } from '../organizations-pro-builder';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';
const { SHARED } = CampaignParticipationStatuses;

function badgeAcquisitionBuilder({ databaseBuilder }) {
  _buildBadgeAcquisition({
    campaignName: 'Campagne PixEmploiClea V1',
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID,
    userId: CERTIF_REGULAR_USER1_ID,
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V1,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne PixEmploiClea V2',
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V2,
    userId: CERTIF_SUCCESS_USER_ID,
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V2,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne PixEmploiClea V3',
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
    userId: CERTIF_SUCCESS_USER_ID,
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V3,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne PixEmploiClea V3',
    targetProfileId: TARGET_PROFILE_PIX_EMPLOI_CLEA_ID_V3,
    userId: CERTIF_FAILURE_USER_ID,
    badgeId: PIX_EMPLOI_CLEA_BADGE_ID_V3,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne Edu Formation Initiale 2nd degré',
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
    userId: CERTIF_EDU_FORMATION_INITIALE_2ND_DEGRE_USER_ID,
    badgeId: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME_BADGE_ID,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne Edu Formation Continue 2nd degré',
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
    userId: CERTIF_EDU_FORMATION_CONTINUE_2ND_DEGRE_USER_ID,
    badgeId: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE_BADGE_ID,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne Edu Formation Initiale 1er degré',
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_1ER_DEGRE,
    userId: CERTIF_EDU_FORMATION_INITIALE_1ER_DEGRE_USER_ID,
    badgeId: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME_BADGE_ID,
    databaseBuilder,
  });
  _buildBadgeAcquisition({
    campaignName: 'Campagne Edu Formation Continue 1er degré',
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE,
    userId: CERTIF_EDU_FORMATION_CONTINUE_1ER_DEGRE_USER_ID,
    badgeId: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE_BADGE_ID,
    databaseBuilder,
  });
}

export default {
  badgeAcquisitionBuilder,
};

function _buildBadgeAcquisition({ campaignName, targetProfileId, userId, badgeId, databaseBuilder }) {
  const campaignParticipationId = _buildRequiredCampaignData({
    campaignName,
    targetProfileId,
    userId,
    databaseBuilder,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    userId,
    badgeId,
    campaignParticipationId,
  });
}

function _buildRequiredCampaignData({ campaignName, targetProfileId, userId, databaseBuilder }) {
  const campaignId = databaseBuilder.factory.buildCampaign({
    name: campaignName,
    type: 'ASSESSMENT',
    targetProfileId,
    organizationId: PRO_COMPANY_ID,
  }).id;
  return participateToAssessmentCampaign({
    databaseBuilder,
    campaignId,
    user: { id: userId },
    organizationLearnerId: PRO_LEARNER_ASSOCIATED_ID,
    status: SHARED,
  });
}
