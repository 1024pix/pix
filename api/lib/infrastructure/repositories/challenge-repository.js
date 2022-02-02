const _ = require('lodash');
const Challenge = require('../../domain/models/Challenge');

const challengeDatasource = require('../datasources/learning-content/challenge-datasource');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const skillAdapter = require('../adapters/skill-adapter');
const solutionAdapter = require('../adapters/solution-adapter');
const LearningContentResourceNotFound = require('../datasources/learning-content/LearningContentResourceNotFound');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async get(id) {
    try {
      const challenge = await challengeDatasource.get(id);
      const skillDataObjects = await skillDatasource.getMany(challenge.skillIds);
      return _toDomain({ challengeDataObject: challenge, skillDataObjects });
    } catch (error) {
      if (error instanceof LearningContentResourceNotFound) {
        throw new NotFoundError();
      }
      throw error;
    }
  },

  async getMany(ids) {
    try {
      const challengeDataObjects = await challengeDatasource.getMany(ids);
      const skills = await skillDatasource.getMany(challengeDataObjects.flatMap(({ skillIds }) => skillIds));
      return _toDomainCollection({ challengeDataObjects, skills });
    } catch (error) {
      if (error instanceof LearningContentResourceNotFound) {
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

  async findOperativeHavingLocale(locale) {
    const challengeDataObjects = await challengeDatasource.findOperativeHavingLocale(locale);
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

  async findFlashCompatible(locale) {
    const challengeDataObjects = await challengeDatasource.findFlashCompatible(locale);
    const activeSkills = await skillDatasource.findActive();
    return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
  },

  async findValidatedBySkillId(skillId) {
    const challengeDataObjects = await challengeDatasource.findValidatedBySkillId(skillId);
    const activeSkills = await skillDatasource.findActive();
    return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
  },

  async findValidatedPrototypeBySkillId(skillId) {
    const challengeDataObjects = await challengeDatasource.findValidatedPrototypeBySkillId(skillId);
    const activeSkills = await skillDatasource.findActive();
    return _toDomainCollection({ challengeDataObjects, skills: activeSkills });
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
  const skills = skillDataObjects.map((skillDataObject) => skillAdapter.fromDatasourceObject(skillDataObject));

  const solution = solutionAdapter.fromDatasourceObject(challengeDataObject);

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
    focused: challengeDataObject.focusable,
    discriminant: challengeDataObject.alpha,
    difficulty: challengeDataObject.delta,
    responsive: challengeDataObject.responsive,
    genealogy: challengeDataObject.genealogy,
  });
}
