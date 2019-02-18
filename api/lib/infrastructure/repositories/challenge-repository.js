const _ = require('lodash');

const Challenge = require('../../domain/models/Challenge');
const Skill = require('../../domain/models/Skill');

const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const solutionAdapter = require('../adapters/solution-adapter');
const airtableDatasourceObjects = require('../datasources/airtable/objects');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  get(id) {

    return challengeDatasource.get(id)
      .then(_generateChallengeDomainModel)
      .catch((error) => {
        if (error instanceof airtableDatasourceObjects.AirtableResourceNotFound) {
          throw new NotFoundError();
        }
        throw error;
      });
  },

  list() {

    return challengeDatasource.list()
      .then(_generateChallengeDomainModels);
  },

  findByCompetenceId(competenceId) {

    return challengeDatasource.findByCompetenceId(competenceId)
      .then(_generateChallengeDomainModels);
  },

  findBySkills(skills) {
    const skillIds = skills.map((skill) => skill.id);
    return challengeDatasource.findBySkillIds(skillIds)
      .then(_generateChallengeDomainModels);
  },
};

function _generateChallengeDomainModels(challengeDataObjects) {
  return skillDatasource.list().then((allSkills) => {
    const lookupSkill = (id) => _.find(allSkills, { id });

    return challengeDataObjects.map((challengeDataObject) => {
      const lookedUpSkillDataObjects = challengeDataObject.skillIds.map(lookupSkill);
      const foundSkillDataObjects = _.compact(lookedUpSkillDataObjects);

      return _adaptChallengeFromDataObjects({
        challengeDataObject,
        skillDataObjects: foundSkillDataObjects
      });
    });
  });
}

function _generateChallengeDomainModel(challengeDataObject) {
  return Promise.all(challengeDataObject.skillIds.map(skillDatasource.get))
    .then((skillDataObjects) => {
      return _adaptChallengeFromDataObjects({ challengeDataObject, skillDataObjects });
    });
}

function _adaptChallengeFromDataObjects({ challengeDataObject, skillDataObjects }) {
  const skills = skillDataObjects.map((skillDataObject) => new Skill({
    id: skillDataObject.id,
    name: skillDataObject.name,
    pixValue: skillDataObject.pixValue,
  }));

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
  });
}
