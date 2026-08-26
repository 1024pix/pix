import dayjs from 'dayjs';

import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { toLegacySnapshot } from '../../../../tooling/knowledge-state/legacy-snapshot.js';

const buildKeData = (data) => ({ source: 'direct', earnedPix: 4, competenceId: 'recCompetenceProgression', ...data });

describe('Integration | Domain | UseCases | get-progression', function () {
  describe('when the assessment is link to a campaign participation', function () {
    describe('campaign Assessment cases', function () {
      let campaign, assessmentId, userId, assessmentCreatedDate, organizationLearner;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
        assessmentCreatedDate = new Date('2024-01-01');

        // Un tube distinct par acquis : l'inférence ne doit pas les lier entre eux.
        const skillDatas = [
          {
            id: 'skillId0Perime',
            name: '@tubePerime1',
            level: 1,
            tubeId: 'tubePerime',
            competenceId: 'recCompetenceProgression',
            status: 'périmé',
          },
          {
            id: 'skillId1Archive',
            name: '@tubeArchive1',
            level: 1,
            tubeId: 'tubeArchive',
            competenceId: 'recCompetenceProgression',
            status: 'archivé',
          },
          {
            id: 'skillId2Actif',
            name: '@tubeActif1',
            level: 1,
            tubeId: 'tubeActif',
            competenceId: 'recCompetenceProgression',
            status: 'actif',
          },
        ];

        skillDatas.forEach((skillData) => {
          const skill = databaseBuilder.factory.learningContent.buildSkill(skillData);
          databaseBuilder.factory.learningContent.buildChallenge({
            id: `challenge-${skill.id}`,
            skillId: skill.id,
          });

          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skill.id });
        });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        });

        await databaseBuilder.commit();
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
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([]));
        });

        it('rate to 0, on user failed all knowledge element from previous assessment', async function () {
          // given
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: false,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: false,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0);
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([]));
        });

        it('rate to 0, on user reset all previous knowledge element from previous assessment', async function () {
          // given
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          // La remise à zéro n'est plus un knowledge element mais une date de reset.
          databaseBuilder.factory.buildKnowledgeReset({
            userId,
            competenceId: 'recCompetenceProgression',
            resetAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0);
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([]));
        });

        it('rate to 1, on user succeed all knowledge element from previous assessment', async function () {
          // given
          const ke1 = { skillId: 'skillId1Archive', status: 'validated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          const ke2 = { skillId: 'skillId2Actif', status: 'validated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1, ke2]));
        });

        it('rate to 1, on user succeed all knowledge element from current assessment', async function () {
          // given
          const ke1 = { skillId: 'skillId1Archive', status: 'validated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            assessmentId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          const ke2 = { skillId: 'skillId2Actif', status: 'validated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            assessmentId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
            withSkill: false,
            withChallenge: false,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1, ke2]));
        });

        it('rate to 1, on user missed some knowledge element from current assessment', async function () {
          // given
          const ke1 = { skillId: 'skillId1Archive', status: 'validated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            assessmentId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          const ke2 = { skillId: 'skillId2Actif', status: 'invalidated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            assessmentId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: false,
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
            withSkill: false,
            withChallenge: false,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(1);
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1, ke2]));
        });

        it('rate to 0.5, on user missed some knowledge element from previous assessment', async function () {
          // given
          const ke1 = { skillId: 'skillId1Archive', status: 'validated' };
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: true,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: false,
            createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.completionRate).equal(0.5);
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1]));
        });
      });

      describe('When participation is shared', function () {
        let sharedAt;

        beforeEach(async function () {
          sharedAt = new Date('2024-02-01');
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            campaignId: campaign.id,
            userId: organizationLearner.userId,
            organizationLearnerId: organizationLearner.id,
            createdAt: assessmentCreatedDate,
            status: CampaignParticipationStatuses.SHARED,
            sharedAt,
          });

          userId = campaignParticipation.userId;
          assessmentId = databaseBuilder.factory.buildAssessment({
            campaignParticipationId: campaignParticipation.id,
            userId: campaignParticipation.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.COMPLETED,
            createdAt: assessmentCreatedDate,
          }).id;

          await databaseBuilder.commit();
        });

        it('ignores the knowledge elements acquired after the participation was shared', async function () {
          // given
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            assessmentId,
            skillId: 'skillId1Archive',
            challengeId: 'challenge-skillId1Archive',
            isOk: true,
            createdAt: dayjs(sharedAt).subtract(1, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });
          databaseBuilder.factory.buildAnsweredSkill({
            userId,
            skillId: 'skillId2Actif',
            challengeId: 'challenge-skillId2Actif',
            isOk: true,
            createdAt: dayjs(sharedAt).add(1, 'day').toDate(),
            withSkill: false,
            withChallenge: false,
          });

          await databaseBuilder.commit();

          // when
          const result = await evaluationUsecases.getProgression({
            progressionId: `progression-${assessmentId}`,
            userId,
          });

          // then
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(true);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          // Seul l'acquis validé avant le partage est retenu.
          expect(result.targetedAssessedSkillIds).to.deep.equal(['skillId1Archive']);
        });
      });
    });

    describe('campaign Exam cases', function () {
      let campaign, assessmentId, userId, assessmentCreatedDate, organizationLearner;

      beforeEach(async function () {
        campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM });
        assessmentCreatedDate = new Date('2024-01-01');

        // Un tube distinct par acquis : l'inférence ne doit pas les lier entre eux.
        const skillDatas = [
          {
            id: 'skillId0Perime',
            name: '@tubePerime1',
            level: 1,
            tubeId: 'tubePerime',
            competenceId: 'recCompetenceProgression',
            status: 'périmé',
          },
          {
            id: 'skillId1Archive',
            name: '@tubeArchive1',
            level: 1,
            tubeId: 'tubeArchive',
            competenceId: 'recCompetenceProgression',
            status: 'archivé',
          },
          {
            id: 'skillId2Actif',
            name: '@tubeActif1',
            level: 1,
            tubeId: 'tubeActif',
            competenceId: 'recCompetenceProgression',
            status: 'actif',
          },
        ];

        skillDatas.forEach((skillData) => {
          const skill = databaseBuilder.factory.learningContent.buildSkill(skillData);
          databaseBuilder.factory.learningContent.buildChallenge({
            id: `challenge-${skill.id}`,
            skillId: skill.id,
          });

          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: skill.id });
        });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: campaign.organizationId,
        });

        await databaseBuilder.commit();
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
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([]));
        });

        it('rate to 0.5 for user with 1/2 validated kes in snaphot from current assessment', async function () {
          // given
          const ke1 = buildKeData({
            skillId: 'skillId1Archive',
            userId,
            status: 'validated',
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: toLegacySnapshot([ke1]),
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
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1]));
        });

        it('rate to 0.5 for user with 1/2 invalidated kes in snaphot from current assessment', async function () {
          // given
          const ke1 = buildKeData({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: 'invalidated',
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: toLegacySnapshot([ke1]),
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
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1]));
        });

        it('rate to 1 for user with all validated kes in snapshot from current assessment', async function () {
          // given
          const ke1 = buildKeData({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: 'validated',
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          const ke2 = buildKeData({
            skillId: 'skillId2Actif',
            userId,
            assessmentId,
            status: 'validated',
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: toLegacySnapshot([ke1, ke2]),
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
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1, ke2]));
        });

        it('rate to 1 for user with all invalidated kes in snapshot from current assessment', async function () {
          // given
          const ke1 = buildKeData({
            skillId: 'skillId1Archive',
            userId,
            assessmentId,
            status: 'invalidated',
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });

          const ke2 = buildKeData({
            skillId: 'skillId2Actif',
            userId,
            assessmentId,
            status: 'invalidated',
            createdAt: dayjs(assessmentCreatedDate).add(1, 'hour').toDate(),
          });
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: toLegacySnapshot([ke1, ke2]),
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
          expect(result.id).to.equal(`progression-${assessmentId}`);
          expect(result.isProfileCompleted).to.equal(false);
          expect(result.skillIds).to.deep.equal(['skillId1Archive', 'skillId2Actif']);
          expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(idsOf([ke1, ke2]));
        });
      });
    });
  });

  describe('when the assessment is a competence evaluation', function () {
    const competenceId = 'recCompetence1';
    const assessmentCreatedDate = new Date('2024-01-15');
    let userId, previousAssessmentId;
    let recentlyInvalidatedKnowledgeElement, validatedKnowledgeElement, longAgoInvalidatedKnowledgeElement;

    // Les knowledge elements se dérivent des réponses : le contexte se construit
    // donc en répondant à des questions, plus en insérant des knowledge elements.
    // Chaque acquis vit dans son propre tube, pour qu'aucune inférence ne les lie.
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      previousAssessmentId = databaseBuilder.factory.buildAssessment({ userId, competenceId }).id;

      ['A', 'B', 'C'].forEach((tube, index) => {
        const skillId = `skillId${index + 1}Actif`;
        databaseBuilder.factory.learningContent.buildSkill({
          id: skillId,
          name: `@tube${tube}1`,
          level: 1,
          competenceId,
          tubeId: `tube${tube}`,
          status: 'actif',
        });
        databaseBuilder.factory.learningContent.buildChallenge({ id: `challenge_${skillId}`, skillId });
      });
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'skillId4Archive',
        name: '@tubeD1',
        level: 1,
        competenceId,
        tubeId: 'tubeD',
        status: 'archivé',
      });

      validatedKnowledgeElement = answerSkill({
        userId,
        assessmentId: previousAssessmentId,
        skillId: 'skillId1Actif',
        isOk: true,
        createdAt: dayjs(assessmentCreatedDate).subtract(10, 'day').toDate(),
      });
      longAgoInvalidatedKnowledgeElement = answerSkill({
        userId,
        assessmentId: previousAssessmentId,
        skillId: 'skillId2Actif',
        isOk: false,
        createdAt: dayjs(assessmentCreatedDate).subtract(20, 'day').toDate(),
      });
      recentlyInvalidatedKnowledgeElement = answerSkill({
        userId,
        assessmentId: previousAssessmentId,
        skillId: 'skillId3Actif',
        isOk: false,
        createdAt: dayjs(assessmentCreatedDate).subtract(1, 'day').toDate(),
      });

      await databaseBuilder.commit();
    });

    it('rate to 1, on the active skills of the competence only', async function () {
      // given
      const assessmentId = _buildCompetenceEvaluationAssessment({
        userId,
        competenceId,
        createdAt: assessmentCreatedDate,
      });

      await databaseBuilder.commit();

      // when
      const result = await evaluationUsecases.getProgression({
        progressionId: `progression-${assessmentId}`,
        userId,
      });

      // then
      expect(result.completionRate).equal(1);
      expect(result.id).to.equal(`progression-${assessmentId}`);
      expect(result.skillIds).to.deep.equal(['skillId1Actif', 'skillId2Actif', 'skillId3Actif']);
      expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(
        idsOf([recentlyInvalidatedKnowledgeElement, validatedKnowledgeElement, longAgoInvalidatedKnowledgeElement]),
      );
      expect(result).to.include({
        id: `progression-${assessmentId}`,
        isProfileCompleted: false,
      });
    });

    it('ignores the invalidated knowledge elements too old to be improved when the assessment is improving', async function () {
      // given
      const assessmentId = _buildCompetenceEvaluationAssessment({
        userId,
        competenceId,
        createdAt: assessmentCreatedDate,
        isImproving: true,
      });

      await databaseBuilder.commit();

      // when
      const result = await evaluationUsecases.getProgression({
        progressionId: `progression-${assessmentId}`,
        userId,
      });

      // then
      expect(result.completionRate).equal(2 / 3);
      expect(result.skillIds).to.deep.equal(['skillId1Actif', 'skillId2Actif', 'skillId3Actif']);
      expect(result.targetedAssessedSkillIds.toSorted()).to.deep.equal(
        idsOf([recentlyInvalidatedKnowledgeElement, validatedKnowledgeElement]),
      );
    });
  });
});

function _buildCompetenceEvaluationAssessment({ userId, competenceId, createdAt, isImproving = false }) {
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId,
    competenceId,
    createdAt,
    isImproving,
    type: Assessment.types.COMPETENCE_EVALUATION,
    state: Assessment.states.STARTED,
  }).id;

  databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });

  return assessmentId;
}

/**
 * Répond à une question portant sur l'acquis donné, et retourne la description
 * du knowledge element que cette réponse fait exister.
 */
function answerSkill({ userId, assessmentId, skillId, isOk, createdAt }) {
  databaseBuilder.factory.buildAnsweredSkill({
    userId,
    assessmentId,
    skillId,
    challengeId: `challenge_${skillId}`,
    isOk,
    createdAt,
    withSkill: false,
    withChallenge: false,
  });

  return {
    userId,
    skillId,
    status: isOk ? 'validated' : 'invalidated',
  };
}

const idsOf = (knowledgeElementDatas) =>
  knowledgeElementDatas.map(({ skillId }) => skillId).toSorted((a, b) => a.localeCompare(b));
