const airtable = require('../airtable');
const serializer = require('../serializers/airtable/challenge-serializer');
const Challenge = require('../../domain/models/Challenge');
const Skill = require('../../domain/models/Skill');

const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const solutionAdapter = require('../adapters/solution-adapter');
const airtableDatasourceObjects = require('../datasources/airtable/objects');
const { NotFoundError } = require('../../domain/errors');

const AIRTABLE_TABLE_NAME = 'Epreuves';

module.exports = {

  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((airtableChallenges) => airtableChallenges.map(serializer.deserialize));
  },

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

  findByCompetence(competence) {

    return challengeDatasource.findByCompetence(competence)
      .then((challengeDataObjects) => Promise.all(challengeDataObjects.map(_convertChallengeDatasourceToDomain)));
  },

  findBySkills(skills) {
    skills = skills.map((skill) => {
      return skill.name;
    });
    return challengeDatasource.findBySkillNames(skills)
      .then((fetchedChallenges) => {
        return fetchedChallenges.map((challenge) => {
          return Challenge.fromAttributes({
            id: challenge.id,
            instruction: challenge.instruction,
            status: challenge.status,
            proposals: challenge.proposals,
            timer: challenge.timer,
            skills: challenge.skills.map((acquis) => {
              return new Skill({ name: acquis });
            }),
          });
        });
      });
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
