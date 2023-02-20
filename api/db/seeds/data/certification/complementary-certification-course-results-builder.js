import { badges } from '../../../constants';

import {
  CERTIFICATION_COURSE_SUCCESS_ID,
  CERTIFICATION_COURSE_FAILURE_ID,
  CERTIFICATION_COURSE_EDU_ID,
} from './certification-courses-builder';

import { PIX_DROIT_MAITRE_BADGE_ID } from '../badges-builder';
import { CERTIF_DROIT_USER5_ID } from './users';

import {
  CLEA_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_DROIT_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_EDU_1ER_DEGRE_COMPLEMENTARY_CERTIFICATION_ID,
  PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_DROIT_MAITRE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  PIX_EDU_1ER_INITIE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
} from './certification-centers-builder';

import { participateToAssessmentCampaign } from '../campaign-participations-builder';
import { TARGET_PROFILE_PIX_DROIT_ID } from '../target-profiles-builder';
import { SUP_STUDENT_ASSOCIATED_ID, SUP_UNIVERSITY_ID } from '../organizations-sup-builder';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';
const { SHARED } = CampaignParticipationStatuses;

function complementaryCertificationCourseResultsBuilder({ databaseBuilder }) {
  const campaignId = databaseBuilder.factory.buildCampaign({
    name: 'Campagne Pix+Droit',
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
    badgeId: PIX_DROIT_MAITRE_BADGE_ID,
    userId: CERTIF_DROIT_USER5_ID,
    campaignParticipationId,
  });
  const { id: complementaryCertifCourseSuccessCleaId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
    certificationCourseId: CERTIFICATION_COURSE_SUCCESS_ID,
    complementaryCertificationId: CLEA_COMPLEMENTARY_CERTIFICATION_ID,
    complementaryCertificationBadgeId: PIX_CLEA_V3_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
  });
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessCleaId,
    acquired: true,
    partnerKey: badges.keys.PIX_EMPLOI_CLEA_V3,
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
      complementaryCertificationBadgeId: PIX_DROIT_MAITRE_COMPLEMENTARY_CERTIFICATION_BADGE_ID,
    },
  );
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId: complementaryCertifCourseSuccessDroitId,
    acquired: true,
    partnerKey: badges.keys.PIX_DROIT_MAITRE_CERTIF,
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

export default {
  complementaryCertificationCourseResultsBuilder,
};
