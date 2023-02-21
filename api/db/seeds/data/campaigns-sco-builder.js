import {
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
} from './target-profiles-builder';

import { PRO_BASICS_BADGE_ID, PRO_TOOLS_BADGE_ID } from './badges-builder';

import {
  SCO_MIDDLE_SCHOOL_ID,
  SCO_HIGH_SCHOOL_ID,
  SCO_AGRI_ID,
  SCO_AEFE_ID,
  SCO_STUDENT_ID,
  SCO_FRENCH_USER_ID,
  SCO_FOREIGNER_USER_ID,
  SCO_FOREIGNER_USER_ID_IN_ANOTHER_ORGANIZATION,
  SCO_DISABLED_USER_ID,
  SCO_STUDENT_NOT_CERTIFIABLE_ID,
} from './organizations-sco-builder';

import {
  participateToAssessmentCampaign,
  participateToProfilesCollectionCampaign,
} from './campaign-participations-builder';
import CampaignParticipationStatuses from '../../../lib/domain/models/CampaignParticipationStatuses';
const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

export default {
  campaignsScoBuilder,
};

function campaignsScoBuilder({ databaseBuilder }) {
  _buildCampaigns({ databaseBuilder });
  _buildScoAssessmentParticipations({ databaseBuilder });
  _buildScoProfilesCollectionParticipations({ databaseBuilder });
}

function _buildCampaigns({ databaseBuilder }) {
  databaseBuilder.factory.buildCampaign({
    id: 4,
    name: 'Sco - Collège - Campagne d’évaluation Badges',
    code: 'SCOBADGE1',
    type: 'ASSESSMENT',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    creatorId: 4,
    ownerId: 4,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-01'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 7,
    name: 'Sco - Collège - Campagne de collecte de profils',
    code: 'SCOCOLECT',
    type: 'PROFILES_COLLECTION',
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    creatorId: 6,
    ownerId: 6,
    idPixLabel: null,
    title: null,
    customLandingPageText: 'Veuillez envoyer votre profil',
    createdAt: new Date('2020-01-02'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 8,
    name: 'Sco - Lycée - Campagne d’évaluation Badges',
    code: 'SCOBADGE2',
    type: 'ASSESSMENT',
    organizationId: SCO_HIGH_SCHOOL_ID,
    creatorId: 5,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-03'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 9,
    name: 'Sco - Agriculture - Campagne d’évaluation Badges',
    code: 'SCOBADGE3',
    type: 'ASSESSMENT',
    organizationId: SCO_AGRI_ID,
    creatorId: 5,
    ownerId: 4,
    targetProfileId: TARGET_PROFILE_STAGES_BADGES_ID,
    assessmentMethod: 'SMART_RANDOM',
    idPixLabel: null,
    title: null,
    customLandingPageText: null,
    createdAt: new Date('2020-01-04'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 23,
    name: 'Sco - AEFE - Campagne d’évaluation Pix+ Édu initiale',
    code: 'PIXEDUINI',
    type: 'ASSESSMENT',
    organizationId: SCO_AEFE_ID,
    creatorId: 4,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
  });

  databaseBuilder.factory.buildCampaign({
    id: 24,
    name: 'Sco - AEFE - Campagne d’évaluation Pix+ Édu continue',
    code: 'PIXEDUCON',
    type: 'ASSESSMENT',
    organizationId: SCO_AEFE_ID,
    creatorId: 4,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
  });

  databaseBuilder.factory.buildCampaign({
    name: 'Sco - AEFE - Campagne d’évaluation Pix+ Édu avec formations recommandées',
    code: 'PIXEDUTRA',
    type: 'ASSESSMENT',
    organizationId: SCO_AEFE_ID,
    creatorId: 4,
    ownerId: 5,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2020-01-07'),
  });
}

function _buildScoAssessmentParticipations({ databaseBuilder }) {
  const scoStudent = { id: SCO_STUDENT_ID, createdAt: new Date('2022-02-04') };
  const scoStudentFrench = { id: SCO_FRENCH_USER_ID, createdAt: new Date('2022-02-05') };
  const scoStudentForeigner = { id: SCO_FOREIGNER_USER_ID, createdAt: new Date('2022-02-05') };
  const scoStudentDisabled = { id: SCO_DISABLED_USER_ID, createdAt: new Date('2022-02-06') };

  const campaignParticipationId = participateToAssessmentCampaign({
    databaseBuilder,
    campaignId: 4,
    user: scoStudent,
    organizationLearnerId: SCO_STUDENT_ID,
    status: SHARED,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    userId: SCO_STUDENT_ID,
    badgeId: PRO_BASICS_BADGE_ID,
    campaignParticipationId,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    userId: SCO_STUDENT_ID,
    badgeId: PRO_TOOLS_BADGE_ID,
    campaignParticipationId,
  });

  participateToAssessmentCampaign({
    databaseBuilder,
    campaignId: 4,
    user: scoStudentFrench,
    organizationLearnerId: SCO_FRENCH_USER_ID,
    status: TO_SHARE,
  });
  participateToAssessmentCampaign({
    databaseBuilder,
    campaignId: 4,
    user: scoStudentForeigner,
    organizationLearnerId: SCO_FOREIGNER_USER_ID,
    status: STARTED,
  });
  participateToAssessmentCampaign({
    databaseBuilder,
    campaignId: 4,
    user: scoStudentDisabled,
    organizationLearnerId: SCO_DISABLED_USER_ID,
    status: SHARED,
  });

  participateToAssessmentCampaign({
    databaseBuilder,
    campaignId: 8,
    user: scoStudentForeigner,
    organizationLearnerId: SCO_FOREIGNER_USER_ID_IN_ANOTHER_ORGANIZATION,
    status: SHARED,
  });
}

function _buildScoProfilesCollectionParticipations({ databaseBuilder }) {
  const scoStudent = { id: SCO_STUDENT_ID, createdAt: new Date('2022-02-05') };
  const scoStudentFrench = { id: SCO_FRENCH_USER_ID, createdAt: new Date('2022-02-06') };
  const scoStudentForeigner = { id: SCO_FOREIGNER_USER_ID, createdAt: new Date('2022-02-07') };
  const scoStudentDisabled = { id: SCO_DISABLED_USER_ID, createdAt: new Date('2022-02-07') };
  const scoStudentNotCertifiable = { id: SCO_STUDENT_NOT_CERTIFIABLE_ID, createdAt: new Date('2022-02-08') };

  participateToProfilesCollectionCampaign({
    databaseBuilder,
    campaignId: 7,
    user: scoStudent,
    organizationLearnerId: SCO_STUDENT_ID,
    status: SHARED,
  });
  participateToProfilesCollectionCampaign({
    databaseBuilder,
    campaignId: 7,
    user: scoStudentFrench,
    organizationLearnerId: SCO_FRENCH_USER_ID,
    status: SHARED,
  });
  participateToProfilesCollectionCampaign({
    databaseBuilder,
    campaignId: 7,
    user: scoStudentForeigner,
    organizationLearnerId: SCO_FOREIGNER_USER_ID,
    status: TO_SHARE,
  });
  participateToProfilesCollectionCampaign({
    databaseBuilder,
    campaignId: 7,
    user: scoStudentDisabled,
    organizationLearnerId: SCO_DISABLED_USER_ID,
    status: SHARED,
  });
  participateToProfilesCollectionCampaign({
    databaseBuilder,
    campaignId: 7,
    user: scoStudentNotCertifiable,
    organizationLearnerId: SCO_STUDENT_NOT_CERTIFIABLE_ID,
    status: SHARED,
  });
}
