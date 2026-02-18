import dayjs from 'dayjs';

import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { constants } from '../../../../../src/shared/domain/constants.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Integration | Domain | UseCases | get-progression', function () {
  describe('when the assessment is link to a campaign participation', function () {
    let originalConstantValueRetrying, originalConstantValueImproving;

    before(function () {
      originalConstantValueRetrying = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
      originalConstantValueImproving = constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;

      sinon.stub(constants, 'MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING').value(0);
      sinon.stub(constants, 'MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING').value(4);
    });

    after(function () {
      sinon.stub(constants, 'MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING').value(originalConstantValueRetrying);
      sinon.stub(constants, 'MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING').value(originalConstantValueImproving);
    });

    describe('campaign Assessment cases', function () {
      let campaign, assessmentId, userId, assessmentCreatedDate, organizationLearner;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
        assessmentCreatedDate = new Date('2024-01-01');

        const skillDatas = [
          {
            id: 'skillId0Perime',
            status: 'périmé',
          },
          {
            id: 'skillId1Archive',
            status: 'archivé',
          },
          {
            id: 'skillId2Actif',
            status: 'actif',
          },
        ];

        skillDatas.forEach((skillData) => {
          const skill = databaseBuilder.factory.learningContent.buildSkill(skillData);

          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skill.id });
        });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        });

        await databaseBuilder.commit();
      });

      describe('When participation has been anonymized', function () {
        it('should throw Forbidden Access', async function () {
          //given
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId: null,
            organizationLearnerId: organizationLearner.id,
            createdAt: assessmentCreatedDate,
            status: CampaignParticipationStatuses.STARTED,
            sharedAt: null,
            deletedAt: new Date(),
          });

          assessmentId = databaseBuilder.factory.buildAssessment({
            campaignParticipationId: null,
            userId: campaignParticipation.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt: assessmentCreatedDate,
          }).id;

          await databaseBuilder.commit();

          const error = await catchErr(evaluationUsecases.getProgression)({
            progressionId: `progression-${assessmentId}`,
            userId: campaignParticipation.userId,
          });

          expect(error).instanceOf(ForbiddenAccess);
        });
      });

      describe('When participation is active', function () {
        beforeEach(async function () {
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
            createdAt: assessmentCreatedDate,
            status: CampaignParticipationStatuses.STARTED,
            sharedAt: null,
          });

          userId = campaignParticipation.userId;
          assessmentId = databaseBuilder.factory.buildAssessment({
            campaignParticipationId: campaignParticipation.id,
            userId: campaignParticipation.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt: assessmentCreatedDate,
          }).id;

          await databaseBuilder.commit();
        });

        it('rate to 0, on user without any knowledge elements', async function () {
          // given

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [],
          });
        });

        it('rate to 0, on user failed all knowledge element from previous assessment', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [],
          });
        });

        it('rate to 0, on user reset all previous knowledge element from previous assessment', async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            status: KnowledgeElement.StatusType.RESET,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });

          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            status: KnowledgeElement.StatusType.RESET,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [],
          });
        });

        it('rate to 1, on user succeed all knowledge element from previous assessment', async function () {
          // given
          const ke1 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });
          const ke2 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1, ke2],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1, ke2],
          });
        });

        it('rate to 1, on user succeed all knowledge element from current assessment', async function () {
          // given
          const ke1 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke2 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1, ke2],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1, ke2],
          });
        });

        it('rate to 1, on user missed some knowledge element from current assessment', async function () {
          // given
          const ke1 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke2 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1, ke2],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1, ke2],
          });
        });

        it('rate to 0.5, on user missed some knowledge element from previous assessment', async function () {
          // given
          const ke1 = databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0.5);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1],
          });
        });
      });
    });

    describe('campaign Exam cases', function () {
      let campaign, assessmentId, userId, assessmentCreatedDate, organizationLearner;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM });
        assessmentCreatedDate = new Date('2024-01-01');

        const skillDatas = [
          {
            id: 'skillId0Perime',
            status: 'périmé',
          },
          {
            id: 'skillId1Archive',
            status: 'archivé',
          },
          {
            id: 'skillId2Actif',
            status: 'actif',
          },
        ];

        skillDatas.forEach((skillData) => {
          const skill = databaseBuilder.factory.learningContent.buildSkill(skillData);

          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skill.id });
        });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        });

        await databaseBuilder.commit();
      });

      describe('When participation has been anonymized', function () {
        it('should throw Forbidden Access', async function () {
          //given
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId: null,
            organizationLearnerId: organizationLearner.id,
            createdAt: assessmentCreatedDate,
            status: CampaignParticipationStatuses.STARTED,
            sharedAt: null,
            deletedAt: new Date(),
          });

          assessmentId = databaseBuilder.factory.buildAssessment({
            campaignParticipationId: null,
            userId: campaignParticipation.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt: assessmentCreatedDate,
          }).id;

          await databaseBuilder.commit();

          const error = await catchErr(evaluationUsecases.getProgression)({
            progressionId: `progression-${assessmentId}`,
            userId: campaignParticipation.userId,
          });

          expect(error).instanceOf(ForbiddenAccess);
        });
      });

      describe('When participation is active', function () {
        let campaignParticipation;
        beforeEach(async function () {
          campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
            createdAt: assessmentCreatedDate,
            status: CampaignParticipationStatuses.STARTED,
            sharedAt: null,
          });

          userId = campaignParticipation.userId;
          assessmentId = databaseBuilder.factory.buildAssessment({
            campaignParticipationId: campaignParticipation.id,
            userId: campaignParticipation.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt: assessmentCreatedDate,
          }).id;

          await databaseBuilder.commit();
        });

        it('rate to 0 for user without any knowledge elements', async function () {
          // given

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [],
          });
        });

        it('rate to 0.5 for user with 1/2 validated kes in snaphot from current assessment', async function () {
          // given
          const ke1 = domainBuilder.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke1FromSnapShot = new KnowledgeElement(domainBuilder.buildKnowledgeElementSnapshot(ke1));

          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: new KnowledgeElementCollection([ke1]).toSnapshot(),
            campaignParticipationId: campaignParticipation.id,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0.5);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1FromSnapShot],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1FromSnapShot],
          });
        });

        it('rate to 0.5 for user with 1/2 invalidated kes in snaphot from current assessment', async function () {
          // given
          const ke1 = domainBuilder.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          const ke1FromSnapShot = new KnowledgeElement(domainBuilder.buildKnowledgeElementSnapshot(ke1));

          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: new KnowledgeElementCollection([ke1]).toSnapshot(),
            campaignParticipationId: campaignParticipation.id,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0.5);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1FromSnapShot],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1FromSnapShot],
          });
        });

        it('rate to 1 for user with all validated kes in snapshot from current assessment', async function () {
          // given
          const ke1 = domainBuilder.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke1FromSnapShot = new KnowledgeElement(domainBuilder.buildKnowledgeElementSnapshot(ke1));

          const ke2 = domainBuilder.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.VALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke2FromSnapShot = new KnowledgeElement(domainBuilder.buildKnowledgeElementSnapshot(ke2));
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: new KnowledgeElementCollection([ke1, ke2]).toSnapshot(),
            campaignParticipationId: campaignParticipation.id,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1FromSnapShot, ke2FromSnapShot],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1FromSnapShot, ke2FromSnapShot],
          });
        });

        it('rate to 1 for user with all invalidated kes in snapshot from current assessment', async function () {
          // given
          const ke1 = domainBuilder.buildKnowledgeElement({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke1FromSnapShot = new KnowledgeElement(domainBuilder.buildKnowledgeElementSnapshot(ke1));

          const ke2 = domainBuilder.buildKnowledgeElement({
            skillId: 'skillId2Actif',
            userId,
            assessmentId,
            status: KnowledgeElement.StatusType.INVALIDATED,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          const ke2FromSnapShot = new KnowledgeElement(domainBuilder.buildKnowledgeElementSnapshot(ke2));
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: new KnowledgeElementCollection([ke1, ke2]).toSnapshot(),
            campaignParticipationId: campaignParticipation.id,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result).to.deep.equal({
            id: `progression-${assessmentId}`,
            isProfileCompleted: false,
            knowledgeElements: [ke1FromSnapShot, ke2FromSnapShot],
            skillIds: ['skillId1Archive', 'skillId2Actif'],
            targetedKnowledgeElements: [ke1FromSnapShot, ke2FromSnapShot],
          });
        });
      });
    });
  });
});
