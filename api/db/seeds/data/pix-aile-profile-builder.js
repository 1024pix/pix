const Assessment = require('../../../lib/domain/models/Assessment');
const CompetenceEvaluation = require('../../../lib/domain/models/CompetenceEvaluation');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const moment = require('moment');
const _ = require('lodash');

module.exports = function buildPixAileProfilev2({ databaseBuilder }) {

  const userId = 1;

  const _buildKnowledgeElement = ({ competenceId, answerId, skillId, assessmentId, keSource, remainingDays, remainingHours }) => {
    const delay = 7 - remainingDays;
    databaseBuilder.factory.buildKnowledgeElement({
      source: keSource,
      skillId,
      assessmentId,
      userId,
      competenceId,
      answerId,
      createdAt: moment().subtract(delay, 'day').add(remainingHours, 'hour').toDate(),
    });
  };

  const buildCampaignParticipation = () => {

    const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      id: 1,
      campaignId: 3,
      userId,
      isShared: false,
      sharedAt: null,
    });

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.SMARTPLACEMENT,
      state: Assessment.states.STARTED,
      campaignParticipationId: campaignParticipation.id,
    });

    return { assessmentId };
  };

  const buildCompetenceEvaluation = ({ competenceId, assessmentState }) => {

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: assessmentState
    });

    databaseBuilder.factory.buildCompetenceEvaluation({
      assessmentId,
      competenceId,
      status: assessmentState === Assessment.states.COMPLETED ? CompetenceEvaluation.statuses.COMPLETED : CompetenceEvaluation.statuses.STARTED,
      userId,
    });

    return { assessmentId };
  };

  const buildCompetencePlacement = ({ competenceId, assessmentState, challengeSkillMap, remainingDays, remainingHours }) => {
    const { assessmentId } = buildCompetenceEvaluation({
      competenceId,
      assessmentState,
    });
    _.map(challengeSkillMap, (challengeSkill) => {

      const { id: answerId } = databaseBuilder.factory.buildAnswer({
        result: 'ok',
        assessmentId,
        challengeId: challengeSkill.challengeId,
      });

      _buildKnowledgeElement({
        competenceId,
        answerId,
        skillId: challengeSkill.skillId,
        assessmentId,
        remainingDays,
        remainingHours,
        keSource: KnowledgeElement.SourceType.DIRECT,
      });

      _.map(challengeSkill.inferredSkillIds, (inferredSkillId) => {
        _buildKnowledgeElement({
          competenceId,
          answerId,
          skillId: inferredSkillId,
          assessmentId,
          remainingDays,
          remainingHours,
          keSource: KnowledgeElement.SourceType.INFERRED,
        });
      });
    });
  };

  // competence 1.1 - assessment not completed - 4 days remaining
  buildCompetencePlacement({
    competenceId: 'recsvLz0W2ShyfD63',
    assessmentState: Assessment.states.STARTED,
    remainingDays: 4,
    challengeSkillMap: [
      { challengeId: 'rec4mYfhm45A222ab', skillId: 'recybd8jWDNiFpbgq', inferredSkillIds: [] },
      { challengeId: 'recwWzTquPlvIl4So', skillId: 'recUDrCWD76fp5MsE', inferredSkillIds: ['rec4Gvnh9kV1NeMsw'] },
      { challengeId: 'rec6ZOkRMNlJNAKgl', skillId: 'recYLxHqrLVUBjF2a', inferredSkillIds: ['recRPl7tXR8n2D5xU']  },
    ],
  });

  // competence 1.3 - assessment completed - 0 days remaining
  buildCompetencePlacement({
    competenceId: 'recNv8qhaY887jQb2',
    assessmentState: Assessment.states.COMPLETED,
    remainingDays: 0,
    challengeSkillMap: [
      { challengeId: 'recPVnm4VSMQUJmq3', skillId: 'recJKLhRCjl9zizHr', inferredSkillIds: ['recdmDASRPMTzOmVc'] },
      { challengeId: 'rec7b0FTFINsQ5u6t', skillId: 'recPiCGFhfgervqr5', inferredSkillIds: ['reckyBHOf8yIl2UGq', 'recfRe4luCCP8GoVA', 'recmMMVns3LEFkHeO'] },
    ],
  });

  // competence 2.1 - assessment completed - 0 days remaining
  buildCompetencePlacement({
    competenceId: 'recDH19F7kKrfL3Ii',
    assessmentState: Assessment.states.COMPLETED,
    remainingDays: 0,
    challengeSkillMap: [
      { challengeId: 'reczK5XPKm5CKImGj', skillId: 'recUDrhjEYqmfahRX', inferredSkillIds: [] },
      { challengeId: 'recChtlIRd8xOz3aP', skillId: 'rec0tk8dZWOzSQbaQ', inferredSkillIds: ['recPGDVdX0LSOWQQC'] },
      { challengeId: 'rec9e4StT33VC0V6M', skillId: 'rec1TZRdq2lKyLEaR', inferredSkillIds: ['recTR73NgMRmrKRhT', 'recl2LAo6vB6BOgUd'] },
    ],
  });

  // competence 2.4 - assessment completed - 0 days remaining
  buildCompetencePlacement({
    competenceId: 'recFpYXCKcyhLI3Nu',
    assessmentState: Assessment.states.COMPLETED,
    remainingDays: 0,
    challengeSkillMap: [
      { challengeId: 'recXN6TmIEgv2w6EC', skillId: 'recZLbpY9xhnR1XaX', inferredSkillIds: [] },
      { challengeId: 'recZVmpmCSMBpxPzl', skillId: 'recdY2TTdWEFz59T1', inferredSkillIds: ['recMG1dWPxaQ3OeZ8', 'recMG1uOZwLGuVyxP', 'recKWLJSisAK7f0Cy'] },
    ],
  });

  // competence 3.3 - assessment completed - 0 days remaining
  buildCompetencePlacement({
    competenceId: 'recHmIWG6D0huq6Kx',
    assessmentState: Assessment.states.COMPLETED,
    remainingDays: 0,
    challengeSkillMap: [
      { challengeId: 'rec6fKT1tmlqI6AT6', skillId: 'rectVTDWtVIT59Dy1', inferredSkillIds: ['recXSjRtUP31qRvun', 'recBeo3fIb35FXtmF', 'recipfF8DQqJjv9pI'] },
      { challengeId: 'recijE4sMaS0mkjVu', skillId: 'recGHY2N1qq1FYH4J', inferredSkillIds: ['recTmjG8ygtFjGfP9', 'rechLuj5ydZs48koG', 'recjaPxapJkF1cx5k', 'recRJyPT0FBEeVkzR'] },
      { challengeId: 'recZjuf1caEli6BHp', skillId: 'recW0pab7QV7dlB97', inferredSkillIds: [] },
    ],
  });

  const { assessmentId: assessmentIdForCampaign } = buildCampaignParticipation();

  // competence 1.2 - campaign - assessment not completed - 0.1 days remaining
  const CHALLENGE_ID_1_2 = 'recilaoo1zSM4U7nM';
  const { id: answerId_1_2 } = databaseBuilder.factory.buildAnswer({
    assessmentId: assessmentIdForCampaign,
    challengeId: CHALLENGE_ID_1_2,
    result: 'ok',
  });

  _buildKnowledgeElement({
    answerId: answerId_1_2,
    competenceId: 'recIkYm646lrGvLNT',
    challengeId: CHALLENGE_ID_1_2,
    skillId: 'recagUd44RPEWti0X',
    assessmentId: assessmentIdForCampaign,
    remainingDays: 0,
    remainingHours: 1,
  });

  // competence 3.1 - campaign - assessment not completed - 0 days remaining
  const CHALLENGE_ID_3_1 = 'recQJ8lx3xyKCvFOh';
  const { id: answerId_3_1 } = databaseBuilder.factory.buildAnswer({
    assessmentId: assessmentIdForCampaign,
    challengeId: CHALLENGE_ID_3_1,
    result: 'ok',
  });

  _buildKnowledgeElement({
    answerId: answerId_3_1,
    competenceId: 'recOdC9UDVJbAXHAm',
    challengeId: CHALLENGE_ID_3_1,
    skillId: 'rec5V9gp65a58nnco',
    assessmentId: assessmentIdForCampaign,
    remainingDays: 0,
  });
};
