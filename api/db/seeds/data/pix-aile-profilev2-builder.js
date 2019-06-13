const Assessment = require('../../../lib/domain/models/Assessment');
const CompetenceEvaluation = require('../../../lib/domain/models/CompetenceEvaluation');
const moment = require('moment');

module.exports = function buildPixAileProfilev2({ databaseBuilder }) {

  const userId = 1;

  const buildKnowledgeElements = ({ competenceId, challengeId, skillId, assessmentId, remainingDays, remainingHours }) => {
    const { id: answerId } = databaseBuilder.factory.buildAnswer({
      result: 'ok',
      assessmentId,
      challengeId,
    });

    const delay = 7 - remainingDays;

    databaseBuilder.factory.buildKnowledgeElement({
      skillId,
      assessmentId,
      userId,
      competenceId,
      answerId,
      createdAt: moment().subtract(delay, 'day').add(remainingHours, 'hour').toDate(),
    });
  };

  const buildCampaignParticipation = () => {

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.SMARTPLACEMENT,
      state: Assessment.states.STARTED
    });

    databaseBuilder.factory.buildCampaignParticipation({
      id: 1,
      campaignId: 3,
      userId,
      assessmentId,
      isShared: false,
      sharedAt: null,
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

  // competence 1.1 - competenceEvaluation - assessment not completed - 4 days remaining
  const { assessmentId: assessmentIdForCompetenceEvaluation1 } = buildCompetenceEvaluation({
    competenceId: 'recsvLz0W2ShyfD63',
    assessmentState: Assessment.states.STARTED,
  });
  buildKnowledgeElements({
    competenceId: 'recsvLz0W2ShyfD63',
    challengeId: 'rec4mYfhm45A222ab',
    skillId: 'recybd8jWDNiFpbgq',
    assessmentId: assessmentIdForCompetenceEvaluation1,
    remainingDays: 4,
  });

  // competence 1.3 - competenceEvaluation - assessment completed - 0 days remaining
  const { assessmentId: assessmentIdForCompetenceEvaluation2 } = buildCompetenceEvaluation({
    competenceId: 'recNv8qhaY887jQb2',
    assessmentState: Assessment.states.COMPLETED,
  });
  buildKnowledgeElements({
    competenceId: 'recNv8qhaY887jQb2',
    challengeId: 'recPVnm4VSMQUJmq3',
    skillId: 'recJKLhRCjl9zizHr',
    assessmentId: assessmentIdForCompetenceEvaluation2,
    remainingDays: 0,
  });

  const { assessmentId: assessmentIdForCampaign } = buildCampaignParticipation();

  // competence 1.2 - campaign - assessment not completed - 0.1 days remaining
  buildKnowledgeElements({
    competenceId: 'recIkYm646lrGvLNT',
    challengeId: 'recilaoo1zSM4U7nM',
    skillId: 'recagUd44RPEWti0X',
    assessmentId: assessmentIdForCampaign,
    remainingDays: 0,
    remainingHours: 1,
  });

  // competence 3.1 - campaign - assessment not completed - 0 days remaining
  buildKnowledgeElements({
    competenceId: 'recOdC9UDVJbAXHAm',
    challengeId: 'recQJ8lx3xyKCvFOh',
    skillId: 'rec5V9gp65a58nnco',
    assessmentId: assessmentIdForCampaign,
    remainingDays: 0,
  });
};
