const airtable = require('../airtable');
const serializer = require('../serializers/airtable/challenge-serializer');
const Challenge = require('../../domain/models/Challenge');
const Skill = require('../../domain/models/Skill');
const Validator = require('../../domain/models/Validator');
const ValidatorQCM = require('../../domain/models/ValidatorQCM');
const ValidatorQCU = require('../../domain/models/ValidatorQCU');
const ValidatorQROC = require('../../domain/models/ValidatorQROC');
const ValidatorQROCMDep = require('../../domain/models/ValidatorQROCMDep');
const ValidatorQROCMInd = require('../../domain/models/ValidatorQROCMInd');

const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const solutionAdapter = require('../adapters/solution-adapter');
const airtableDatasourceObjects = require('../datasources/airtable/objects');
const { NotFoundError } = require('../../domain/errors');

const AIRTABLE_TABLE_NAME = 'Epreuves';

function _getSkillDataObjects(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function getValidatorForType({ challengeType, solution }) {
  switch (challengeType) {
    case 'QCU':
      return new ValidatorQCU({ solution });

    case 'QCM':
      return new ValidatorQCM({ solution });

    case 'QROC':
      return new ValidatorQROC({ solution });

    case 'QROCM-ind':
      return new ValidatorQROCMInd({ solution });

    case 'QROCM-dep':
      return new ValidatorQROCMDep({ solution });

    default:
      return new Validator({ solution });
  }
}

module.exports = {

  list() {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, {})
      .then((airtableChallenges) => airtableChallenges.map(serializer.deserialize));
  },

  findByCompetence(competence) {
    return airtable.findRecords(AIRTABLE_TABLE_NAME, { view: competence.reference })
      .then((airtableChallenges) => airtableChallenges.map(serializer.deserialize));
  },

  findBySkills(skills) {
    skills = skills.map((skill) => {
      return skill.name;
    });
    return challengeDatasource.findBySkills(skills)
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

  get(id) {
    let challengeDataObject;

    return challengeDatasource.get(id)
      .then((result) => challengeDataObject = result)
      .then(_getSkillDataObjects)
      .then((skillDataObjects) => {
        const skills = skillDataObjects.map((skillDataObject) => new Skill(skillDataObject));
        const solution = solutionAdapter.fromChallengeAirtableDataObject(challengeDataObject);
        const validator = getValidatorForType({ challengeType: challengeDataObject.type, solution });

        return new Challenge({
          id: challengeDataObject.id,
          type: challengeDataObject.type,
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
      })
      .catch((error) => {
        if (error instanceof airtableDatasourceObjects.AirtableResourceNotFound) {
          throw new NotFoundError();
        }

        throw error;
      });
  },
};
