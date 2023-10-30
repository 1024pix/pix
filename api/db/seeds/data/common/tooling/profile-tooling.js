import _ from 'lodash';
import * as learningContent from './learning-content.js';
import * as generic from './generic.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../lib/domain/constants.js';
const UNREACHABLE_PIX_SCORE = 999999;

export {
  createCertifiableProfile,
  createPerfectProfile,
  getAnswersAndKnowledgeElementsForAdvancedProfile,
  getAnswersAndKnowledgeElementsForBeginnerProfile,
  getAnswersAndKnowledgeElementsForIntermediateProfile,
  getAnswersAndKnowledgeElementsForPerfectProfile,
};

/**
 * Fonction générique pour créer un profil ayant 5 compétences Pix au niveau 1
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function createCertifiableProfile({ databaseBuilder, userId }) {
  const answersAndKnowledgeElementsCollection = await getAnswersAndKnowledgeElementsForBeginnerProfile();
  _makeUserReachPixScoreForCompetences({
    databaseBuilder,
    userId,
    answersAndKnowledgeElementsCollection,
  });

  await databaseBuilder.commit();
}

/**
 * Fonction générique pour créer un profil ayant toutes les compétences Pix au niveau maximum
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function createPerfectProfile({ databaseBuilder, userId }) {
  const answersAndKnowledgeElementsCollection = await getAnswersAndKnowledgeElementsForPerfectProfile();

  _makeUserReachPixScoreForCompetences({
    databaseBuilder,
    userId,
    answersAndKnowledgeElementsCollection,
  });

  await databaseBuilder.commit();
}

const ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_BEGINNER_PROFILE = [];
async function getAnswersAndKnowledgeElementsForBeginnerProfile() {
  if (ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_BEGINNER_PROFILE.length === 0) {
    const pixCompetences = await learningContent.getCoreCompetences();
    const fiveRandomCompetences = generic.pickRandomAmong(pixCompetences, 5);

    await _getAnswersAndKnowledgeElementsForProfile({
      competences: fiveRandomCompetences,
      answersAndKnowledgeElementsCollection: ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_BEGINNER_PROFILE,
      pixScoreByCompetence: PIX_COUNT_BY_LEVEL,
    });
  }

  return ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_BEGINNER_PROFILE;
}

const ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_INTERMEDIATE_PROFILE = [];
async function getAnswersAndKnowledgeElementsForIntermediateProfile() {
  if (ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_INTERMEDIATE_PROFILE.length === 0) {
    const pixCompetences = await learningContent.getCoreCompetences();
    const eightRandomCompetences = generic.pickRandomAmong(pixCompetences, 8);

    await _getAnswersAndKnowledgeElementsForProfile({
      competences: eightRandomCompetences,
      answersAndKnowledgeElementsCollection: ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_INTERMEDIATE_PROFILE,
      pixScoreByCompetence: PIX_COUNT_BY_LEVEL * 3,
    });
  }

  return ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_INTERMEDIATE_PROFILE;
}

const ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_ADVANCED_PROFILE = [];
async function getAnswersAndKnowledgeElementsForAdvancedProfile() {
  if (ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_ADVANCED_PROFILE.length === 0) {
    const pixCompetences = await learningContent.getCoreCompetences();
    const twelveRandomCompetences = generic.pickRandomAmong(pixCompetences, 12);

    await _getAnswersAndKnowledgeElementsForProfile({
      competences: twelveRandomCompetences,
      answersAndKnowledgeElementsCollection: ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_ADVANCED_PROFILE,
      pixScoreByCompetence: PIX_COUNT_BY_LEVEL * 4,
    });
  }

  return ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_ADVANCED_PROFILE;
}

const ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_PERFECT_PROFILE = [];
async function getAnswersAndKnowledgeElementsForPerfectProfile() {
  if (ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_PERFECT_PROFILE.length === 0) {
    const pixCompetences = await learningContent.getCoreCompetences();

    await _getAnswersAndKnowledgeElementsForProfile({
      competences: pixCompetences,
      answersAndKnowledgeElementsCollection: ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_PERFECT_PROFILE,
      pixScoreByCompetence: UNREACHABLE_PIX_SCORE,
    });
  }

  return ANSWERS_AND_KNOWLEDGE_ELEMENTS_FOR_PERFECT_PROFILE;
}

async function _getAnswersAndKnowledgeElementsForProfile({
  competences,
  pixScoreByCompetence,
  answersAndKnowledgeElementsCollection,
}) {
  for (const competence of competences) {
    const skills = await learningContent.findActiveSkillsByCompetenceId(competence.id);
    const orderedSkills = _.sortBy(skills, 'level');
    let currentPixScore = 0;
    for (const skill of orderedSkills) {
      const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
      const answerData = {
        value: 'dummy value',
        result: 'ok',
        challengeId: challenge.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeout: null,
        resultDetails: 'dummy value',
      };

      const keData = {
        source: 'direct',
        status: 'validated',
        skillId: skill.id,
        createdAt: new Date(),
        earnedPix: skill.pixValue,
        competenceId: skill.competenceId,
      };
      answersAndKnowledgeElementsCollection.push({ answerData, keData });

      currentPixScore += skill.pixValue;
      if (currentPixScore >= pixScoreByCompetence) {
        break;
      }
    }
  }
}

function _makeCompetenceEvaluation({ databaseBuilder, userId, competenceId }) {
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId,
    competenceId,
    type: Assessment.types.COMPETENCE_EVALUATION,
    state: Assessment.states.COMPLETED,
  }).id;
  databaseBuilder.factory.buildCompetenceEvaluation({
    userId,
    competenceId,
    assessmentId,
    status: CompetenceEvaluation.statuses.STARTED,
  });
  return assessmentId;
}

function _makeUserReachPixScoreForCompetences({ databaseBuilder, userId, answersAndKnowledgeElementsCollection }) {
  const answersAndKnowledgeElementsByCompetenceId = _.groupBy(
    answersAndKnowledgeElementsCollection,
    ({ keData }) => keData.competenceId,
  );
  for (const [competenceId, answersAndKnowledgeElements] of Object.entries(answersAndKnowledgeElementsByCompetenceId)) {
    const assessmentId = _makeCompetenceEvaluation({ databaseBuilder, userId, competenceId });

    for (const { answerData, keData } of answersAndKnowledgeElements) {
      const answerId = databaseBuilder.factory.buildAnswer({
        assessmentId,
        ...answerData,
      }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        assessmentId,
        userId,
        answerId,
        ...keData,
      });
    }
  }
}
