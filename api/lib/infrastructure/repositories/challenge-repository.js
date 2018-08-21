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
      .then(_convertChallengeDatasourceToDomain)
      .catch((error) => {
        if (error instanceof airtableDatasourceObjects.AirtableResourceNotFound) {
          throw new NotFoundError();
        }
        throw error;
      });
  },

  list() {

    return challengeDatasource.list()
      .then((challengeDataObjects) => Promise.all(challengeDataObjects.map(_convertChallengeDatasourceToDomain)));
  },

  findByCompetence(competence) {

    return challengeDatasource.findByCompetence(competence)
      .then((challengeDataObjects) => Promise.all(challengeDataObjects.map(_convertChallengeDatasourceToDomain)));
  },

  findBySkills(skills) {

    const skillNames = skills.map((skill) => skill.name);
    return challengeDatasource.findBySkillNames(skillNames)
      .then((challengeDataObjects) => Promise.all(challengeDataObjects.map(_convertChallengeDatasourceToDomain)));
  },
};

function _convertChallengeDatasourceToDomain(challengeDataObject) {

  return Promise.resolve(challengeDataObject)
    .then(_getSkillDataObjects)
    .then((skillDataObjects) => {
      const skills = skillDataObjects.map((skillDataObject) => new Skill({
        id: skillDataObject.id,
        name: skillDataObject.name,
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
        skills,
        embedUrl: challengeDataObject.embedUrl,
        embedTitle: challengeDataObject.embedTitle,
        embedHeight: challengeDataObject.embedHeight,
        validator,
      });
    });
}

function _getSkillDataObjects(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}
