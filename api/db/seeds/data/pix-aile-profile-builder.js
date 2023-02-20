import Assessment from '../../../lib/domain/models/Assessment';
import CompetenceEvaluation from '../../../lib/domain/models/CompetenceEvaluation';
import KnowledgeElement from '../../../lib/domain/models/KnowledgeElement';
import moment from 'moment';
import _ from 'lodash';

export default function buildPixAileProfilev2({ databaseBuilder }) {

  const userId = 1;

  const _buildKnowledgeElement = ({ competenceId, answerId, skillId, assessmentId, keStatus, keSource, remainingDays, remainingHours }) => {
    const delay = 7 - remainingDays;
    databaseBuilder.factory.buildKnowledgeElement({
      source: keSource,
      status: keStatus ? keStatus : KnowledgeElement.StatusType.VALIDATED,
      skillId,
      assessmentId,
      userId,
      competenceId,
      answerId,
      createdAt: moment().subtract(delay, 'day').add(remainingHours, 'hour').toDate(),
    });
  };

  const buildCompetenceEvaluation = ({ competenceId, assessmentState }) => {

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: assessmentState,
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
        keStatus: challengeSkill.knowledgeElementStatus,
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
      { challengeId: 'rec6ZOkRMNlJNAKgl', skillId: 'recYLxHqrLVUBjF2a', inferredSkillIds: ['recRPl7tXR8n2D5xU'] },
      {
        challengeId: 'recX3USEK62h8rACE', skillId: 'recfO8994EvSQV9Ip', inferredSkillIds: ['rec0aOgRFRJ1qPG0b'],
        knowledgeElementStatus: KnowledgeElement.StatusType.INVALIDATED,
      },
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
}
