import { badges } from '../../../constants.js';

import {
  CERTIFICATION_COURSE_SUCCESS_ID,
  CERTIFICATION_COURSE_FAILURE_ID,
  CERTIFICATION_COURSE_EDU_ID,
} from './certification-courses-builder.js';

import { CERTIF_DROIT_USER5_ID } from './users.js';

import { PIX_DROIT_AVANCE_BADGE_ID } from '../badges-builder.js';
import {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_DROIT_AVANCE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_1ER_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
} from './certification-centers-builder.js';

import { participateToAssessmentCampaign } from '../campaign-participations-builder.js';
import { TARGET_PROFILE_PIX_DROIT_ID } from '../target-profiles-builder.js';
import { SUP_STUDENT_ASSOCIATED_ID, SUP_UNIVERSITY_ID } from '../organizations-sup-builder.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/CampaignParticipationStatuses.js';
const { SHARED } = CampaignParticipationStatuses;

function complementaryCertificationCourseResultsBuilder({ databaseBuilder }) {
  const campaignId = databaseBuilder.factory.buildCampaign({
    name: 'Campagne Pix+Droit',
    code: 'PIXPLUS01',
    type: 'ASSESSMENT',
    targetProfileId: TARGET_PROFILE_PIX_DROIT_ID,
    organizationId: SUP_UNIVERSITY_ID,
  }).id;
  const campaignParticipationId = participateToAssessmentCampaign({
    databaseBuilder,
    campaignId,
    user: { id: CERTIF_DROIT_USER5_ID },
    organizationLearnerId: SUP_STUDENT_ASSOCIATED_ID,
    status: SHARED,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: PIX_DROIT_AVANCE_BADGE_ID,
    userId: CERTIF_DROIT_USER5_ID,
    campaignParticipationId,
  });

  const { id: complementaryCertifCourseFailureId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_FAILURE_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    complementaryCertificationBadgeId: PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseFailureId,
    acquired: false,
    partnerKey: badges.keys.PIX_EMPLOI_CLEA_V3,
  });

  const { id: complementaryCertifCourseSuccessDroitId } = databaseBuilder.factory.buildComplementaryCertificationCourse(
    {
      certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID,
      complementaryCertificationId: PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
      complementaryCertificationBadgeId: PIX_DROIT_AVANCE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    },
  );
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessDroitId,
    acquired: true,
    partnerKey: badges.keys.PIX_DROIT_AVANCE_CERTIF,
  });

  const { id: complementaryCertifCourseEduId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_EDU_ID,
    complementaryCertificationId: PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
    complementaryCertificationBadgeId: PIX_EDU_1ER_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseEduId,
    acquired: true,
    partnerKey: badges.keys.PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  });
}

export { complementaryCertificationCourseResultsBuilder };
