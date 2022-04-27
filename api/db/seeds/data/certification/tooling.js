const _ = require('lodash');
const bluebird = require('bluebird');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
let allChallenges = [];
let allPixCompetences = [];
const skillsByCompetenceId = {};

async function makeUserPixCertifiable({ userId, countCertifiableCompetences, levelOnEachCompetence, databaseBuilder }) {
  await _cacheLearningContent();
  const pickedCompetences = await _pickRandomCompetences(countCertifiableCompetences);
  await bluebird.mapSeries(pickedCompetences, (competence) => {
    return _makeCompetenceCertifiable({ userId, databaseBuilder, competence, levelOnEachCompetence });
  });
}

async function _cacheLearningContent() {
  if (allChallenges.length === 0) {
    allChallenges = await challengeRepository.list();
    allPixCompetences = await competenceRepository.listPixCompetencesOnly();
    await bluebird.mapSeries(allPixCompetences, async (pixCompetence) => {
      skillsByCompetenceId[pixCompetence.id] = await skillRepository.findActiveByCompetenceId(pixCompetence.id);
    });
  }
}

async function _pickRandomCompetences(countCompetences) {
  const shuffledCompetences = _.sortBy(allPixCompetences, () => _.random(0, 100));
  return _.slice(shuffledCompetences, 0, countCompetences);
}

async function _makeCompetenceCertifiable({ databaseBuilder, userId, competence, levelOnEachCompetence }) {
  const skillsToValidate = await _findSkillsToValidate(competence, levelOnEachCompetence);
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId,
    type: 'COMPETENCE_EVALUATION',
    state: 'completed',
  }).id;
  await bluebird.mapSeries(skillsToValidate, async (skill) => {
    const challenge = _findFirstChallengeValidatedBySkillId(skill.id);
    const answerId = databaseBuilder.factory.buildAnswer({
      value: 'dummy value',
      result: 'ok',
      assessmentId,
      challengeId: challenge.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeout: null,
      resultDetails: 'dummy value',
    }).id;
    databaseBuilder.factory.buildKnowledgeElement({
      source: 'direct',
      status: 'validated',
      answerId,
      assessmentId,
      skillId: skill.id,
      createdAt: new Date(),
      earnedPix: skill.pixValue,
      userId,
      competenceId: skill.competenceId,
    });
  });
}

async function _findSkillsToValidate(competence, expectedLevel) {
  const skills = skillsByCompetenceId[competence.id];
  const orderedByDifficultySkills = _(skills)
    .map((skill) => {
      skill.difficulty = parseInt(skill.name.slice(-1));
      return skill;
    })
    .sortBy('difficulty')
    .value();
  const pickedSkills = [];
  let pixScore = 0;
  while ((pixScore < 8 * expectedLevel || pickedSkills.length < 3) && orderedByDifficultySkills.length > 0) {
    const currentSkill = orderedByDifficultySkills.shift();
    pixScore += currentSkill.pixValue;
    pickedSkills.push(currentSkill);
  }
  return pickedSkills;
}

function _findFirstChallengeValidatedBySkillId(skillId) {
  return _.find(allChallenges, { status: 'validé', skill: { id: skillId } });
}

module.exports = { makeUserPixCertifiable };
