const Joi = require('joi');
const bluebird = require('bluebird');
const { NotFoundError } = require('../lib/domain/errors');
const BadgeCriterion = require('../lib/domain/models/BadgeCriterion');
const badgeRepository = require('../lib/infrastructure/repositories/badge-repository');
const badgeCriteriaRepository = require('../lib/infrastructure/repositories/badge-criteria-repository');
const skillSetRepository = require('../lib/infrastructure/repositories/skill-set-repository');
const DomainTransaction = require('../lib/infrastructure/DomainTransaction');
const { knex, disconnect } = require('../db/knex-database-connection');

// Usage: node scripts/create-badge-criteria-for-specified-badge path/data.json
// data.json
// {
//   "badgeId": 112,
//   "criteria": [
//     {
//       "threshold": 23,
//       "scope": "CampaignParticipation",
//       "skillSetIds": null
//     },
//     {
//       "threshold": 26,
//       "scope": "SkillSet",
//       "skillSetIds": [100683, 100687]
//     }
//   ]
// }

async function checkBadgeExistence(badgeId) {
  try {
    await badgeRepository.get(badgeId);
  } catch (error) {
    throw new NotFoundError(`Badge ${badgeId} not found`);
  }
}

function checkCriteriaFormat(criteria) {
  const badgeCriterionSchema = Joi.object({
    threshold: Joi.number().min(0).max(100),
    scope: Joi.string().valid('CampaignParticipation', 'SkillSet'),
    skillSetIds: Joi.array().items(Joi.number()).min(1).allow(null),
  });

  criteria.forEach((badgeCriterion) => {
    const { error } = badgeCriterionSchema.validate(badgeCriterion);
    if (error) {
      throw error;
    }
    if (
      badgeCriterion.scope === BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION &&
      badgeCriterion.skillSetIds?.length > 0
    ) {
      throw new Error('Badge criterion is invalid : SkillSetIds provided for CampaignParticipation scope');
    }

    if (badgeCriterion.scope === BadgeCriterion.SCOPES.SKILL_SET && !badgeCriterion.skillSetIds) {
      throw new Error('Badge criterion is invalid : SkillSetIds should be provided for SkillSet scope');
    }
  });
}

async function checkSkillSetIds(skillSetIds) {
  const [{ count }] = await knex('skill-sets').count('*').whereIn('id', skillSetIds);
  if (count !== skillSetIds.length) {
    throw new Error('At least one skillSetId does not exist');
  }
}

async function _createBadgeCriterion(badgeCriterion, domainTransaction) {
  const newSkillSetIds = await copySkillSets({
    skillSetIds: badgeCriterion.skillSetIds,
    newBadgeId: badgeCriterion.badgeId,
  });
  return badgeCriteriaRepository.save(
    { badgeCriterion: { ...badgeCriterion, skillSetIds: newSkillSetIds } },
    domainTransaction
  );
}

async function copySkillSets({ skillSetIds, newBadgeId }) {
  const skillSets = await knex('skill-sets').select('name', 'skillIds').whereIn('id', skillSetIds);
  return bluebird.mapSeries(skillSets, async (skillSet) => {
    const savedSkillSet = await skillSetRepository.save({ skillSet: { ...skillSet, badgeId: newBadgeId } });
    return savedSkillSet.id;
  });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating badge criteria');

  const filePath = process.argv[2];

  console.log('Reading json data file... ');
  const jsonFile = require(filePath);
  console.log('ok');

  await checkBadgeExistence(jsonFile.badgeId);
  console.log('Badge exists');

  checkCriteriaFormat(jsonFile.criteria);
  console.log('BadgeCriteria schema ok');

  console.log('Check skillSet');
  await bluebird.mapSeries(jsonFile.criteria, async (badgeCriterion) => {
    if (badgeCriterion.skillSetIds) {
      await checkSkillSetIds(badgeCriterion.skillSetIds);
    }
  });
  console.log('Check skillSet ok');

  console.log('Creating badge criteria... ');
  console.log('Saving badge criteria... ');
  return DomainTransaction.execute(async (domainTransaction) => {
    await bluebird.mapSeries(jsonFile.criteria, (badgeCriterion) => {
      return _createBadgeCriterion({ ...badgeCriterion, badgeId: jsonFile.badgeId }, domainTransaction);
    });
  });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = { checkBadgeExistence, checkCriteriaFormat, checkSkillSetIds, copySkillSets };
