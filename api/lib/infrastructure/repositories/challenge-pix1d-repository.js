const Challenge = require('../../domain/models/Challenge.js');

const { challengeDatasource } = require('../datasources/learning-content/challenge-datasource.js');
const { skillDatasource } = require('../datasources/learning-content/skill-datasource.js');
const { tubeDatasource } = require('../datasources/learning-content/tube-datasource.js');
const solutionAdapter = require('../adapters/solution-adapter.js');
const LearningContentResourceNotFound = require('../datasources/learning-content/LearningContentResourceNotFound.js');
const { NotFoundError } = require('../../domain/errors.js');

function getPix1dSkillNamePrefix(missionNamePrefix, activityLevel) {
  return `${missionNamePrefix}_${activityLevel}`;
}

async function getMissionNamePrefix(missionId) {
  const [firstTube] = await tubeDatasource.findByThematicId(missionId);
  const activityName = firstTube.name;
  return activityName.split('_')[0];
}

module.exports = {
  async get({ missionId, activityLevel, answerLength }) {
    try {
      const missionNamePrefix = await getMissionNamePrefix(missionId);
      const skillNamePrefix = getPix1dSkillNamePrefix(missionNamePrefix, activityLevel);
      const skills = await skillDatasource.findBySkillNamePrefix(skillNamePrefix);
      if (skills.length === 0) return;
      if (answerLength < skills.length) {
        const [{ id: skillId }] = skills.filter((skill) => skill.name === `${skillNamePrefix}${answerLength + 1}`);
        const challenge = await challengeDatasource.getBySkillId(skillId);
        return _toDomain({ challengeDataObject: challenge });
      }
    } catch (error) {
      if (error instanceof LearningContentResourceNotFound) {
        throw new NotFoundError();
      }
      throw error;
    }
  },
};

function _toDomain({ challengeDataObject }) {
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
  });
}
