import _ from 'lodash';
import * as challengeRepository from '../lib/infrastructure/repositories/challenge-repository.js';
import * as skillsRepository from '../lib/infrastructure/repositories/skill-repository.js';
import * as competencesRepository from '../src/shared/infrastructure/repositories/competence-repository.js';

async function findChallengesWithSkills() {
  const [challenges, skillsFromDb] = await _getReferentialData();
  const skills = _addLevelTubeAndLinkedSkillsToEachSkills(skillsFromDb);

  const knowledgeElementsToCreateForEachChallenges = [];
  _.forEach(challenges, (challenge) => {
    knowledgeElementsToCreateForEachChallenges[challenge.id] = [];
    const skillsOfChallenges = _getSkillsOfChallenge(challenge.skills, skills);
    const skillsValidatedIfChallengeIsSuccessful = _getValidatedSkills(skillsOfChallenges);
    const skillsInvalidatedIfChallengeIsFailed = _getInvalidatedSkills(skillsOfChallenges);

    const knowledgeElementsValidatedDirect = _.map(skillsOfChallenges, (skill) => _createObjectValidatedDirect(skill));
    const knowledgeElementsValidatedInferred = _.map(skillsValidatedIfChallengeIsSuccessful, (skill) =>
      _createObjectValidatedInferred(skill),
    );

    const knowledgeElementsInvalidatedDirect = _.map(skillsOfChallenges, (skill) =>
      _createObjectInvalidatedDirect(skill),
    );
    const knowledgeElementsInvalidatedInferred = _.map(skillsInvalidatedIfChallengeIsFailed, (skill) =>
      _createObjectInvalidatedInferred(skill),
    );

    knowledgeElementsToCreateForEachChallenges[challenge.id]['validated'] = _.concat(
      knowledgeElementsValidatedDirect,
      knowledgeElementsValidatedInferred,
    );
    knowledgeElementsToCreateForEachChallenges[challenge.id]['invalidated'] = _.concat(
      knowledgeElementsInvalidatedDirect,
      knowledgeElementsInvalidatedInferred,
    );
  });

  return knowledgeElementsToCreateForEachChallenges;
}

async function _getReferentialData() {
  // Récupération des challenges qui ont des acquis
  let challenges = await challengeRepository.findValidated();
  challenges = _.filter(challenges, (c) => {
    return c.skills.length > 0;
  });

  // Récupération des compétences (pour les acquis)
  const competences = await competencesRepository.list();
  // Récupération des acquis par compétences
  let skills = await Promise.all(
    _.map(competences, (competence) => {
      // eslint-disable-next-line import/namespace
      return skillsRepository.findByCompetenceId(competence.id);
    }),
  );

  skills = _.flatten(skills);
  return [challenges, skills];
}

function _addLevelTubeAndLinkedSkillsToEachSkills(skills) {
  _(skills)
    .forEach((skill) => {
      skill.level = skill.name.slice(-1);
      skill.tube = skill.name.substring(1, skill.name.length - 1);
    })
    .forEach((skill) => {
      skill.lowerSkills = _.filter(skills, (otherSkill) => {
        return otherSkill.tube === skill.tube && otherSkill.level < skill.level;
      });
      skill.higherSkills = _.filter(skills, (otherSkill) => {
        return otherSkill.tube === skill.tube && otherSkill.level > skill.level;
      });
    });
  return skills;
}

function _getValidatedSkills(skillsOfChallenges) {
  const skillsValidated = _(skillsOfChallenges)
    .map((skillGivenByChallenge) => {
      return skillGivenByChallenge.lowerSkills;
    })
    .flatten()
    .remove((skillValidated) => {
      return !_.some(skillsOfChallenges, (skill) => {
        return skill.id === skillValidated.id;
      });
    })
    .uniqBy('id')
    .value();
  return skillsValidated;
}

function _getInvalidatedSkills(skillsOfChallenges) {
  const skillsInvalidated = _.intersectionBy(_.flatMap(skillsOfChallenges, 'higherSkills'), skillsOfChallenges, 'id');
  return skillsInvalidated;
}

function _getSkillsOfChallenge(skillsOfChallenge, skills) {
  const idOfSkills = _.map(skillsOfChallenge, 'id');
  return _.filter(skills, (skill) => {
    return _.includes(idOfSkills, skill.id);
  });
}

function _createObjectValidatedDirect(skill) {
  return {
    source: 'direct',
    status: 'validated',
    skillId: skill.id,
    earnedPix: skill.pixValue,
    competenceId: skill.competenceId,
  };
}

function _createObjectValidatedInferred(skill) {
  return {
    source: 'inferred',
    status: 'validated',
    skillId: skill.id,
    earnedPix: skill.pixValue,
    competenceId: skill.competenceId,
  };
}

function _createObjectInvalidatedDirect(skill) {
  return {
    source: 'direct',
    status: 'invalidated',
    skillId: skill.id,
    earnedPix: 0,
    competenceId: skill.competenceId,
  };
}

function _createObjectInvalidatedInferred(skill) {
  return {
    source: 'inferred',
    status: 'invalidated',
    skillId: skill.id,
    earnedPix: 0,
    competenceId: skill.competenceId,
  };
}

export { findChallengesWithSkills };
