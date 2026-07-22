import sinon from 'sinon';

import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/constants.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Evaluation | Integration | Usecase | Save and correct answer for campaign', function () {
  const skillIds = ['monAcquisA_Id', 'monAcquisB_Id', 'monAcquisC_Id'];

  context('for deleted campaign', function () {
    it('should throw a ForbiddenAccess', async function () {
      // given
      const locale = 'fr';
      const userId = databaseBuilder.factory.buildUser().id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        // campaignParticipationId are nullify when campaign is deleted
        campaignParticipationId: null,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'monAreaId',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'maCompetenceId',
        areaId: 'monAreaId',
        name_i18n: {
          fr: 'nom de la compétence',
        },
      });
      databaseBuilder.factory.learningContent.buildChallenge({
        id: 'monEpreuveId',
        skillId: skillIds[2],
        competenceId: 'maCompetenceId',
        locales: [locale],
        status: 'validé',
        solution: 'correct',
        proposals: '${a}',
        type: 'QROC',
      });
      skillIds.map((id, index) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        }),
      );
      const someAnswerId = databaseBuilder.factory.buildAnswer().id;
      const someOtherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: someOtherAssessmentId,
        answerId: someAnswerId,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const answer = new Answer({
        value: 'correct',
        challengeId: 'monEpreuveId',
        assessmentId: assessment.id,
      });
      const error = await catchErr(evaluationUsecases.saveAndCorrectAnswerForCampaign)({
        answer,
        userId,
        assessment,
        locale,
        forceOKAnswer: false,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });

  context('for archived campaign', function () {
    it('should throw a ForbiddenAccess', async function () {
      // given
      const locale = 'fr';
      const userId = databaseBuilder.factory.buildUser().id;
      const learner = databaseBuilder.factory.buildOrganizationLearner({ userId });
      const campaign = databaseBuilder.factory.buildCampaign({
        code: 'PILIPILIX',
        archivedAt: new Date(),
        organizationId: learner.organizationId,
      });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        userId: userId,
        organizationLearnerId: learner.id,
        campaignId: campaign.id,
      });
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: participation.id,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'monAreaId',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'maCompetenceId',
        areaId: 'monAreaId',
        name_i18n: {
          fr: 'nom de la compétence',
        },
      });
      databaseBuilder.factory.learningContent.buildChallenge({
        id: 'monEpreuveId',
        skillId: skillIds[2],
        competenceId: 'maCompetenceId',
        locales: [locale],
        status: 'validé',
        solution: 'correct',
        proposals: '${a}',
        type: 'QROC',
      });
      skillIds.map((id, index) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        }),
      );
      const someAnswerId = databaseBuilder.factory.buildAnswer().id;
      const someOtherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: someOtherAssessmentId,
        answerId: someAnswerId,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment({
        ...assessmentDB,
        campaign: domainBuilder.buildCampaign(campaign),
      });
      const answer = new Answer({
        value: 'correct',
        challengeId: 'monEpreuveId',
        assessmentId: assessment.id,
      });
      const error = await catchErr(evaluationUsecases.saveAndCorrectAnswerForCampaign)({
        answer,
        userId,
        assessment,
        locale,
        forceOKAnswer: false,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenAccess);
    });
  });

  context('for campaign of type assessment with method smart_random', function () {
    it('should correct answer and save both answer and knowledge-elements', async function () {
      // given
      const locale = 'fr';
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        code: 'PILIPILIX',
      }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: null,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId,
        status: CompetenceEvaluation.statuses.STARTED,
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'monAreaId',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'maCompetenceId',
        areaId: 'monAreaId',
        name_i18n: {
          fr: 'nom de la compétence',
        },
      });
      databaseBuilder.factory.learningContent.buildChallenge({
        id: 'monEpreuveId',
        skillId: skillIds[2],
        competenceId: 'maCompetenceId',
        locales: [locale],
        status: 'validé',
        solution: 'correct',
        proposals: '${a}',
        type: 'QROC',
      });
      skillIds.map((id, index) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        }),
      );

      const someAnswerId = databaseBuilder.factory.buildAnswer().id;
      const someOtherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: someOtherAssessmentId,
        answerId: someAnswerId,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const answer = new Answer({
        value: 'correct',
        challengeId: 'monEpreuveId',
        assessmentId: assessment.id,
      });

      const savedAnswer = await evaluationUsecases.saveAndCorrectAnswerForCampaign({
        answer,
        userId,
        assessment,
        locale,
        forceOKAnswer: false,
      });

      // then
      const keData = await knex('knowledge-elements')
        .select(['source', 'status', 'skillId'])
        .where({ userId })
        .orderBy('skillId', 'createdAt');
      sinon.assert.match(keData[0], {
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillIds[0],
      });
      sinon.assert.match(keData[1], {
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillIds[0],
      });
      sinon.assert.match(keData[2], {
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillIds[1],
      });
      sinon.assert.match(keData[3], {
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillIds[2],
      });
      expect(keData.length).to.equal(4);
      sinon.assert.match(savedAnswer, {
        id: sinon.match.number,
        result: AnswerStatus.OK,
        levelup: {
          id: savedAnswer.id,
          competenceName: 'nom de la compétence',
          level: 3,
        },
      });
      expect(savedAnswer).to.be.instanceOf(Answer);
    });
  });

  context('for campaign of type exam with method smart_random', function () {
    it('should correct answer and save both answer and knowledge-elements', async function () {
      // given
      const locale = 'fr';
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.EXAM,
      }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: null,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.buildCompetenceEvaluation({
        userId,
        status: CompetenceEvaluation.statuses.STARTED,
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'monAreaId',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'maCompetenceId',
        areaId: 'monAreaId',
        name_i18n: {
          fr: 'nom de la compétence',
        },
      });
      databaseBuilder.factory.learningContent.buildChallenge({
        id: 'monEpreuveId',
        skillId: skillIds[2],
        competenceId: 'maCompetenceId',
        locales: [locale],
        status: 'validé',
        solution: 'correct',
        proposals: '${a}',
        type: 'QROC',
      });
      skillIds.map((id, index) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        }),
      );
      const someAnswerId = databaseBuilder.factory.buildAnswer().id;
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: assessmentDB.id,
        answerId: someAnswerId,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const knowledgeElementsBefore = new KnowledgeElementCollection([knowledgeElement]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore.toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const answer = new Answer({
        value: 'correct',
        challengeId: 'monEpreuveId',
        assessmentId: assessment.id,
      });
      const savedAnswer = await evaluationUsecases.saveAndCorrectAnswerForCampaign({
        answer,
        userId,
        assessment,
        locale,
        forceOKAnswer: false,
      });

      // then
      const knowledgeElements = await knex('knowledge-element-snapshots')
        .select('snapshot')
        .where('campaignParticipationId', campaignParticipationId)
        .first();

      expect(knowledgeElements.snapshot).lengthOf(3);
      const expectedKnowledgeElements = knowledgeElements.snapshot.map(({ source, status, skillId }) => {
        return { source, status, skillId };
      });

      expect(expectedKnowledgeElements).deep.members([
        {
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillIds[0],
        },
        {
          source: KnowledgeElement.SourceType.INFERRED,
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillIds[1],
        },
        {
          source: KnowledgeElement.SourceType.DIRECT,
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillIds[2],
        },
      ]);

      sinon.assert.match(savedAnswer, {
        id: sinon.match.number,
        result: AnswerStatus.OK,
        levelup: {},
      });
      expect(savedAnswer).to.be.instanceOf(Answer);
    });
  });
});
