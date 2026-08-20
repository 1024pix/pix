import sinon from 'sinon';

import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/constants.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { deserializeSnapshot } from '../../../../../src/shared/domain/services/knowledge-state-snapshot.js';
import * as knowledgeStateRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-repository.js';
import * as skillRepository from '../../../../../src/shared/infrastructure/repositories/skill-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { toLegacySnapshot } from '../../../../tooling/knowledge-state/legacy-snapshot.js';
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
        state: Assessment.states.STARTED,
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
        status: 'validated',
        source: 'direct',
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
        state: Assessment.states.STARTED,
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
        status: 'validated',
        source: 'direct',
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
    it('should correct and save the answer, without persisting any knowledge element', async function () {
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
        state: Assessment.states.STARTED,
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

      // Acquis validé lors d'un parcours antérieur, exprimé par une réponse.
      const someOtherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
      databaseBuilder.factory.buildAnsweredSkill({
        userId,
        assessmentId: someOtherAssessmentId,
        skillId: skillIds[0],
        competenceId: 'maCompetenceId',
        isOk: true,
        createdAt: new Date('2020-01-01'),
        withSkill: false,
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
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
      expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.have.members(skillIds);
      expect(knowledgeState.isDirect({ id: skillIds[0], tubeId: 'monTubeId', difficulty: 1 })).to.be.true;
      expect(knowledgeState.isDirect({ id: skillIds[1], tubeId: 'monTubeId', difficulty: 2 })).to.be.false;
      expect(knowledgeState.isDirect({ id: skillIds[2], tubeId: 'monTubeId', difficulty: 3 })).to.be.true;
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
        state: Assessment.states.STARTED,
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
      const knowledgeElement = {
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: assessmentDB.id,
        answerId: someAnswerId,
        status: 'validated',
        source: 'direct',
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      };
      const knowledgeElementsBefore = toLegacySnapshot([knowledgeElement]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore,
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
      const snapshotRow = await knex('knowledge-state-snapshots')
        .select('snapshot')
        .where('campaignParticipationId', campaignParticipationId)
        .first();

      // L'instantané retient l'état par tube : les trois acquis d'un même tube
      // tiennent en une entrée.
      expect(Object.keys(snapshotRow.snapshot.tubes)).lengthOf(1);

      const allSkills = await skillRepository.list();
      const stateFromSnapshot = deserializeSnapshot({ snapshot: snapshotRow.snapshot, allSkills });
      expect(stateFromSnapshot.validatedSkills().map(({ id }) => id)).to.have.members(skillIds);
      expect(stateFromSnapshot.isDirect({ id: skillIds[1], tubeId: 'monTubeId', difficulty: 2 })).to.be.false;

      sinon.assert.match(savedAnswer, {
        id: sinon.match.number,
        result: AnswerStatus.OK,
        levelup: {},
      });
      expect(savedAnswer).to.be.instanceOf(Answer);
    });
  });
});
