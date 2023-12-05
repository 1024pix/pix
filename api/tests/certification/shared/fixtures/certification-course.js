import { databaseBuilder, domainBuilder, mockLearningContent } from '../../../test-helper.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import {
  buildArea,
  buildChallenge,
  buildCompetence,
  buildFramework,
  buildThematic,
  buildTube,
} from '../../../tooling/domain-builder/factory/index.js';
import { buildLearningContent } from '../../../tooling/learning-content-builder/index.js';
import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';
import { KnowledgeElement } from '../../../../lib/domain/models/index.js';

const createLearningContent = () => {
  const framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
  const competenceId = 'competenceId';

  const challenge1 = buildChallenge({
    id: 'recCHAL1',
  });

  const skill1 = {
    id: 'recSK123',
    name: '@sau3',
    pixValue: 3,
    competenceId,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    challenges: [challenge1],
    tubeId: 'tubeId1',
    version: 1,
    level: 3,
  };

  challenge1.skill = skill1;

  const skill2 = {
    id: 'recSK456',
    name: '@sau4',
    pixValue: 3,
    competenceId,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    tubeId: 'tubeId2',
    version: 1,
    level: 4,
  };
  const skill3 = {
    id: 'recSK789',
    name: '@sau7',
    pixValue: 3,
    competenceId,
    tutorialIds: [],
    learningMoreTutorialIds: [],
    tubeId: 'tubeId3',
    version: 1,
    level: 7,
  };
  const tube1 = buildTube({ id: 'tubeId1', competenceId, skills: [skill1] });
  const tube2 = buildTube({ id: 'tubeId2', competenceId, skills: [skill2] });
  const tube3 = buildTube({ id: 'tubeId3', competenceId, skills: [skill3] });
  const area = buildArea({ id: 'areaId', frameworkId: framework.id });
  const competence = buildCompetence({ id: 'competenceId', area, tubes: [tube1, tube2, tube3] });
  const thematic = buildThematic({
    id: 'thematicId',
    competenceId: 'competenceId',
    tubeIds: ['tubeId1', 'tubeId2', 'tubeId3'],
  });
  competence.thematics = [thematic];
  area.competences = [competence];
  framework.areas = [area];
  const learningContent = buildLearningContent([framework]);
  mockLearningContent(learningContent);

  return {
    challenges: [challenge1],
    framework,
  };
};

const buildCertificationChallengesFromChallenges = ({ challenges, certificationCourse }) => {
  challenges.forEach((challenge) => {
    databaseBuilder.factory.buildCertificationChallenge({
      associatedSkillName: challenge.skill.name,
      associatedSkillId: challenge.skill.id,
      challengeId: challenge.id,
      competenceId: challenge.skill.competenceId,
      courseId: certificationCourse.id,
    });
  });
};

const buildOkAnswersFromChallenges = ({ challenges, assessment }) => {
  return challenges.map((challenge) => {
    const answer = domainBuilder.buildAnswer({
      assessmentId: assessment.id,
      challengeId: challenge.id,
      result: AnswerStatus.OK,
    });
    databaseBuilder.factory.buildAnswer({
      ...answer,
      result: answer.isOk() ? AnswerStatus.OK.status : AnswerStatus.KO.status,
    });
    return answer;
  });
};

const findChallengeById = (challenges, searchedId) => {
  return challenges.find(({ id }) => searchedId === id);
};

const buildKnowledgeElementsFromAnswers = ({ answers, challenges, userId }) => {
  answers.forEach((answer) => {
    const challenge = findChallengeById(challenges, answer.challengeId);
    databaseBuilder.factory.buildKnowledgeElement({
      status: answer.isOk() ? KnowledgeElement.StatusType.VALIDATED : KnowledgeElement.StatusType.INVALIDATED,
      skillId: challenge.skill.id,
      assessmentId: answer.assessmentId,
      answerId: answer.id,
      userId,
      earnedPix: 8,
      competenceId: challenge.skill.competenceId,
    });
  });
};

export const createSuccessfulCertificationCourse = async ({ userId }) => {
  const { challenges } = createLearningContent();

  const session = databaseBuilder.factory.buildSession({
    publishedAt: new Date('2018-12-01T01:02:03Z'),
  });
  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    sessionId: session.id,
    userId,
  });
  const assessment = databaseBuilder.factory.buildAssessment({
    userId,
    certificationCourseId: certificationCourse.id,
    type: Assessment.types.CERTIFICATION,
    state: 'completed',
  });
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationCourse.id,
    assessmentId: assessment.id,
    level: 1,
    pixScore: 23,
    emitter: 'PIX-ALGO',
    status: 'validated',
  });

  buildCertificationChallengesFromChallenges({ challenges, certificationCourse });

  const answers = buildOkAnswersFromChallenges({ challenges, assessment });

  buildKnowledgeElementsFromAnswers({
    answers,
    challenges,
    userId,
  });

  await databaseBuilder.commit();

  return {
    assessment,
    assessmentResult,
    certificationCourse,
    session,
  };
};
