import dayjs from 'dayjs';

import { evaluationUsecases } from '../../../../../../src/evaluation/domain/usecases/index.js';
import * as prescriptionCampaignApi from '../../../../../../src/prescription/campaign/application/api/campaigns-api.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { usecases as prescriptionTargetProfilesUsecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { assertNotNullOrUndefined } from '../../../../../../src/shared/domain/models/asserts.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { sharedUsecases } from '../../../../../../src/shared/domain/usecases/index.js';
import * as profileTooling from '../../../../data/common/tooling/profile-tooling.js';
import { CLEA_V2_TARGET_PROFILE_ID } from '../../../common/complementary-certification-builder.js';

/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {number} params.organizationId - organization linked to the campaign
 * @param {Object} params.organizationMember - organization member creator of the campaign
 * @returns {Promise<SessionEnrolment>}
 */
export default async function obtainCleaBadgeForUser({
  databaseBuilder,
  organizationId,
  organizationMemberId,
  certifiableUserId,
}) {
  assertNotNullOrUndefined(organizationId);
  assertNotNullOrUndefined(organizationMemberId);
  assertNotNullOrUndefined(certifiableUserId);

  const campaign = await _createCampaign({ organizationId, organizationMemberId });

  const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign.id,
    userId: certifiableUserId,
    status: CampaignParticipationStatuses.SHARED,
    isCertifiable: true,
  });

  const assessmentDb = databaseBuilder.factory.buildAssessment({
    userId: certifiableUserId,
    type: Assessment.types.CAMPAIGN,
    state: Assessment.states.COMPLETED,
    isImproving: false,
    lastQuestionDate: new Date(),
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    competenceId: null,
    campaignParticipationId,
  });

  const keDataForSnapshot = [];
  const answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForPerfectProfile();

  for (const { answerData, keData } of answersAndKnowledgeElements) {
    const answerId = databaseBuilder.factory.buildAnswer({
      assessmentId: assessmentDb.id,
      answerData,
    }).id;

    keDataForSnapshot.push(
      databaseBuilder.factory.buildKnowledgeElement({
        assessmentId: assessmentDb.id,
        answerId,
        userId: certifiableUserId,
        ...keData,
        createdAt: dayjs().subtract(1, 'day'),
      }),
    );
  }

  databaseBuilder.factory.buildKnowledgeElementSnapshot({
    snapshot: new KnowledgeElementCollection(keDataForSnapshot).toSnapshot(),
    campaignParticipationId,
  });

  await databaseBuilder.commit();

  const assessment = await sharedUsecases.getAssessment({
    assessmentId: assessmentDb.id,
    locale: FRENCH_FRANCE,
  });

  await evaluationUsecases.handleBadgeAcquisition({ assessment });
}

/**
 * A double certification requires user to pass a campaign
 */
const _createCampaign = async ({ organizationId, organizationMemberId }) => {
  const cleaTargetProfile = await prescriptionTargetProfilesUsecases.getTargetProfile({
    targetProfileId: CLEA_V2_TARGET_PROFILE_ID,
  });

  const savedCampaign = await prescriptionCampaignApi.save({
    name: 'Double certification CLEA V3 Campaign',
    title: 'Double certification CLEA V3 Campaign',
    targetProfileId: cleaTargetProfile.id,
    organizationId,
    creatorId: organizationMemberId,
  });

  return savedCampaign;
};
