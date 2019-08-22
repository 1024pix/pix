const Assessment = require('../../../lib/domain/models/Assessment');
const CompetenceEvaluation = require('../../../lib/domain/models/CompetenceEvaluation');
const moment = require('moment');
const _ = require('lodash');

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
  const challengeSkillMapCompetenceEvaluation1 = [
    { challengeId: 'rec4mYfhm45A222ab', skillId: 'recybd8jWDNiFpbgq' },
    { challengeId: 'recwWzTquPlvIl4So', skillId: 'recUDrCWD76fp5MsE' },
    { challengeId: 'rec6ZOkRMNlJNAKgl', skillId: 'recYLxHqrLVUBjF2a' },
    { challengeId: 'recig28tbjrFTKhsJ', skillId: 'recbtdpzdLz6ZqURl' },
    { challengeId: 'recQ8Q3Qyoi4t1WdL', skillId: 'reciDyXWqxp7ypbWu' },
  ];
  _.map(challengeSkillMapCompetenceEvaluation1, (challengeSkill) => {
    buildKnowledgeElements({
      competenceId: 'recsvLz0W2ShyfD63',
      challengeId: challengeSkill.challengeId,
      skillId: challengeSkill.skillId,
      assessmentId: assessmentIdForCompetenceEvaluation1,
      remainingDays: 4,
    });
  });

  // competence 1.3 - competenceEvaluation - assessment completed - 0 days remaining
  const { assessmentId: assessmentIdForCompetenceEvaluation2 } = buildCompetenceEvaluation({
    competenceId: 'recNv8qhaY887jQb2',
    assessmentState: Assessment.states.COMPLETED,
  });
  const challengeSkillMapCompetenceEvaluation2 = [
    { challengeId: 'recPVnm4VSMQUJmq3', skillId: 'recJKLhRCjl9zizHr' },
    { challengeId: 'rec7b0FTFINsQ5u6t', skillId: 'recPiCGFhfgervqr5' },
    { challengeId: 'recTRFWrqvpWTLciu', skillId: 'reciVlfNtTgkQJCHt' },
    { challengeId: 'recPxi2BSGvZlYwBG', skillId: 'recPLREwTLP8MZ7Ib' },
    { challengeId: 'recpalexhqUwZcNYs', skillId: 'recPc4uMolcbvwXzr' },
  ];
  _.map(challengeSkillMapCompetenceEvaluation2, (challengeSkill) => {
    buildKnowledgeElements({
      competenceId: 'recNv8qhaY887jQb2',
      challengeId: challengeSkill.challengeId,
      skillId: challengeSkill.skillId,
      assessmentId: assessmentIdForCompetenceEvaluation2,
      remainingDays: 0,
    });
  });

  // competence 2.1 - competenceEvaluation - assessment completed - 0 days remaining
  const { assessmentId: assessmentIdForCompetenceEvaluation3 } = buildCompetenceEvaluation({
    competenceId: 'recDH19F7kKrfL3Ii',
    assessmentState: Assessment.states.COMPLETED,
  });
  const challengeSkillMapCompetenceEvaluation3 = [
    { challengeId: 'reczK5XPKm5CKImGj', skillId: 'recUDrhjEYqmfahRX' },
    { challengeId: 'recChtlIRd8xOz3aP', skillId: 'rec0tk8dZWOzSQbaQ' },
    { challengeId: 'rec9e4StT33VC0V6M', skillId: 'rec1TZRdq2lKyLEaR' },
    { challengeId: 'rec1OlfvEmdcxtWIq', skillId: 'recPGDVdX0LSOWQQC' },
    { challengeId: 'recf7KX7ZWNOwspjG', skillId: 'reciF9dxvDfMUuFcb' },
  ];
  _.map(challengeSkillMapCompetenceEvaluation3, (challengeSkill) => {
    buildKnowledgeElements({
      competenceId: 'recDH19F7kKrfL3Ii',
      challengeId: challengeSkill.challengeId,
      skillId: challengeSkill.skillId,
      assessmentId: assessmentIdForCompetenceEvaluation3,
      remainingDays: 0,
    });
  });

  // competence 2.4 - competenceEvaluation - assessment completed - 0 days remaining
  const { assessmentId: assessmentIdForCompetenceEvaluation4 } = buildCompetenceEvaluation({
    competenceId: 'recFpYXCKcyhLI3Nu',
    assessmentState: Assessment.states.COMPLETED,
  });
  const challengeSkillMapCompetenceEvaluation4 = [
    { challengeId: 'recXN6TmIEgv2w6EC', skillId: 'recZLbpY9xhnR1XaX' },
    { challengeId: 'recZVmpmCSMBpxPzl', skillId: 'recdY2TTdWEFz59T1' },
    { challengeId: 'recPHnFaHMzesamFh', skillId: 'rec5jAYpcEr4Ad3kV' },
    { challengeId: 'recfUTaFMKo7zRZgg', skillId: 'recrFCl1Ng8YUaba2' },
    { challengeId: 'recH8tN3Da1FGQweV', skillId: 'recMG1dWPxaQ3OeZ8' },
    { challengeId: 'rec28EDEVRU6ZoybB', skillId: 'recJ8Zi62i43AQqYI' },
  ];
  _.map(challengeSkillMapCompetenceEvaluation4, (challengeSkill) => {
    buildKnowledgeElements({
      competenceId: 'recFpYXCKcyhLI3Nu',
      challengeId: challengeSkill.challengeId,
      skillId: challengeSkill.skillId,
      assessmentId: assessmentIdForCompetenceEvaluation4,
      remainingDays: 0,
    });
  });

  // competence 3.3 - competenceEvaluation - assessment completed - 0 days remaining
  const { assessmentId: assessmentIdForCompetenceEvaluation5 } = buildCompetenceEvaluation({
    competenceId: 'recHmIWG6D0huq6Kx',
    assessmentState: Assessment.states.STARTED,
  });
  const challengeSkillMapCompetenceEvaluation5 = [
    { challengeId: 'recaYeYSVtmPVYCYe', skillId: 'recTmjG8ygtFjGfP9' },
    { challengeId: 'rec6fKT1tmlqI6AT6', skillId: 'rectVTDWtVIT59Dy1' },
    { challengeId: 'recijE4sMaS0mkjVu', skillId: 'recGHY2N1qq1FYH4J' },
    { challengeId: 'recZjuf1caEli6BHp', skillId: 'recW0pab7QV7dlB97' },
    { challengeId: 'rec4TJEBRLtr6O3Aw', skillId: 'recBeo3fIb35FXtmF' },
  ];
  _.map(challengeSkillMapCompetenceEvaluation5, (challengeSkill) => {
    buildKnowledgeElements({
      competenceId: 'recHmIWG6D0huq6Kx',
      challengeId: challengeSkill.challengeId,
      skillId: challengeSkill.skillId,
      assessmentId: assessmentIdForCompetenceEvaluation5,
      remainingDays: 0,
    });
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
