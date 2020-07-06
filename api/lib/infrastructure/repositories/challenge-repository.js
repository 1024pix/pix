const _ = require('lodash');

const Challenge = require('../../domain/models/Challenge');

const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const skillAdapter = require('../adapters/skill-adapter');
const solutionAdapter = require('../adapters/solution-adapter');
const AirtableResourceNotFound = require('../datasources/airtable/AirtableResourceNotFound');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  get(id) {

    return challengeDatasource.get(id)
      .then(_generateChallengeDomainModel)
      .catch((error) => {
        if (error instanceof AirtableResourceNotFound) {
          throw new NotFoundError();
        }
        throw error;
      });
  },

  async findValidated() {
    const challengeDataObjects = await challengeDatasource.findValidated();
    const activeSkills = await skillDatasource.findActive();
    return _generateChallengeDomainModels({ challengeDataObjects, skills: activeSkills });
  },

  async findOperative() {
    const challengeDataObjects = await challengeDatasource.findOperative();
    const operativeSkills = await skillDatasource.findOperative();
    return _generateChallengeDomainModels({ challengeDataObjects, skills: operativeSkills });
  },

  async findValidatedByCompetenceId(competenceId) {
    const challengeDataObjects = await challengeDatasource.findValidatedByCompetenceId(competenceId);
    const activeSkills = await skillDatasource.findActive();
    return _generateChallengeDomainModels({ challengeDataObjects, skills: activeSkills });
  },

  async findOperativeBySkills(skills) {
    const skillIds = skills.map((skill) => skill.id);
    const challengeDataObjects = await challengeDatasource.findOperativeBySkillIds(skillIds);
    const operativeSkills = await skillDatasource.findOperative();
    return _generateChallengeDomainModels({ challengeDataObjects, skills: operativeSkills });
  },
};

function _generateChallengeDomainModels({ challengeDataObjects, skills }) {
  const lookupSkill = (id) => _.find(skills, { id });
  const challenges = challengeDataObjects.map((challengeDataObject) => {
    const lookedUpSkillDataObjects = challengeDataObject.skillIds.map(lookupSkill);
    const foundSkillDataObjects = _.compact(lookedUpSkillDataObjects);

    return _adaptChallengeFromDataObjects({
      challengeDataObject,
      skillDataObjects: foundSkillDataObjects
    });
  });

  return challenges;
}

function _generateChallengeDomainModel(challengeDataObject) {
  return Promise.all(challengeDataObject.skillIds.map(skillDatasource.get))
    .then((skillDataObjects) => {
      return _adaptChallengeFromDataObjects({ challengeDataObject, skillDataObjects });
    });
}

function _adaptChallengeFromDataObjects({ challengeDataObject, skillDataObjects }) {
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
