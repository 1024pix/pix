const _ = require('lodash');
const bluebird = require('bluebird');
const Challenge = require('../../domain/models/Challenge');

const challengeDatasource = require('../datasources/learning-content/challenge-datasource');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const skillAdapter = require('../adapters/skill-adapter');
const solutionAdapter = require('../adapters/solution-adapter');
const AirtableResourceNotFound = require('../datasources/learning-content/AirtableResourceNotFound');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  async get(id) {
    try {
      const challenge = await challengeDatasource.get(id);
      const skillDataObjects = await bluebird.mapSeries(challenge.skillIds, (skillId) => {
        return skillDatasource.get(skillId);
      });
      return _toDomain({ challengeDataObject: challenge, skillDataObjects });
    } catch (error) {
      if (error instanceof AirtableResourceNotFound) {
        throw new NotFoundError();
      }
      throw error;
    }
  },

  async findValidated() {
    const challengeDataObjects = await challengeDatasource.findValidated();
    const activeSkills = await skillDatasource.findActive();
    return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
  },

  async findOperative() {
    const challengeDataObjects = await challengeDatasource.findOperative();
    const operativeSkills = await skillDatasource.findOperative();
    return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
  },

  async findFrenchFranceOperative() {
    const challengeDataObjects = await challengeDatasource.findFrenchFranceOperative();
    const operativeSkills = await skillDatasource.findOperative();
    return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
  },

  async findValidatedByCompetenceId(competenceId) {
    const challengeDataObjects = await challengeDatasource.findValidatedByCompetenceId(competenceId);
    const activeSkills = await skillDatasource.findActive();
    return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
  },

  async findOperativeBySkills(skills) {
    const skillIds = skills.map((skill) => skill.id);
    const challengeDataObjects = await challengeDatasource.findOperativeBySkillIds(skillIds);
    const operativeSkills = await skillDatasource.findOperative();
    return _toDomainCollection({ challengeDataObjects, skills: operativeSkills });
  },
};

function _toDomainCollection({ challengeDataObjects, skills }) {
  const lookupSkill = (id) => _.find(skills, { id });
  const challenges = challengeDataObjects.map((challengeDataObject) => {
    const lookedUpSkillDataObjects = challengeDataObject.skillIds.map(lookupSkill);
    const skillDataObjects = _.compact(lookedUpSkillDataObjects);

    return _toDomain({
      challengeDataObject,
      skillDataObjects,
    });
  });

  return challenges;
}

function _toDomain({ challengeDataObject, skillDataObjects }) {
  const skills = skillDataObjects.map((skillDataObject) => skillAdapter.fromAirtableDataObject(skillDataObject));

  const solution = solutionAdapter.fromChallengeAirtableDataObject(challengeDataObject);

  const validator = Challenge.createValidatorForChallengeType({
    challengeType: challengeDataObject.type,
    solution,
  });

  return new Challenge({
    id: challengeDataObject.id,
    type: challengeDataObject.type,
    status: challengeDataObject.status,
    instruction: challengeDataObject.instruction,
    alternativeInstruction: challengeDataObject.alternativeInstruction,
    proposals: challengeDataObject.proposals,
    timer: challengeDataObject.timer,
    illustrationUrl: challengeDataObject.illustrationUrl,
    attachments: challengeDataObject.attachments,
    embedUrl: challengeDataObject.embedUrl,
    embedTitle: challengeDataObject.embedTitle,
    embedHeight: challengeDataObject.embedHeight,
    skills,
    validator,
    competenceId: challengeDataObject.competenceId,
    illustrationAlt: challengeDataObject.illustrationAlt,
    format: challengeDataObject.format,
    locales: challengeDataObject.locales,
    autoReply: challengeDataObject.autoReply,
  });
}
