import dayjs from 'dayjs';

import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { assertNotNullOrUndefined } from '../../../../../../src/shared/domain/models/asserts.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import * as profileTooling from '../../../../data/common/tooling/profile-tooling.js';

const PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID = 60;

/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {number} params.organizationId
 * @param {number} params.organizationMemberId
 * @param {number} params.targetProfileId
 * @param {number[]} params.certifiableUsersIds
 * @returns {Promise<void>}
 */
export default async function obtainDroitBadgeForUser({
  databaseBuilder,
  organizationId,
  organizationMemberId,
  targetProfileId,
  certifiableUsersIds,
}) {
  assertNotNullOrUndefined(organizationId);
  assertNotNullOrUndefined(organizationMemberId);
  assertNotNullOrUndefined(targetProfileId);
  assertNotNullOrUndefined(certifiableUsersIds);

  const campaignId = databaseBuilder.factory.buildCampaign({
    name: 'Double certification Pix+Droit Campaign',
    title: 'Double certification Pix+Droit Campaign',
    targetProfileId,
    organizationId,
    creatorId: organizationMemberId,
    ownerId: organizationMemberId,
  }).id;

  for (const certifiableUserId of certifiableUsersIds) {
    const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
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
      snapshot: JSON.stringify(keDataForSnapshot),
      campaignParticipationId,
    });

    databaseBuilder.factory.buildBadgeAcquisition({
      badgeId: PIX_DROIT_INITIE_CERTIFIABLE_BADGE_ID,
      userId: certifiableUserId,
      campaignParticipationId,
    });
  }

  await databaseBuilder.commit();
}
