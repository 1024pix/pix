('use strict');
const Joi = require('joi');
const { NotFoundError } = require('../lib/domain/errors');
const BadgeCriterion = require('../lib/domain/models/BadgeCriterion');
const badgeRepository = require('../lib/infrastructure/repositories/badge-repository');
const badgeCriteriaRepository = require('../lib/infrastructure/repositories/badge-criteria-repository');
const DomainTransaction = require('../lib/infrastructure/DomainTransaction');
const { knex } = require('../db/knex-database-connection');

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
  await Promise.all(
    jsonFile.criteria.map((badgeCriterion) => {
      if (badgeCriterion.skillSetIds) {
        checkSkillSetIds(badgeCriterion.skillSetIds);
      }
    })
  );
  console.log('Check skillSet ok');

  console.log('Creating badge criteria... ');
  console.log('Saving badge criteria... ');
  return DomainTransaction.execute(async (domainTransaction) => {
    await Promise.all(
      jsonFile.criteria.map((badgeCriterion) =>
        badgeCriteriaRepository.save(
          { badgeCriterion: { ...badgeCriterion, badgeId: jsonFile.badgeId } },
          domainTransaction
        )
      )
    );
  });
}

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

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = { checkBadgeExistence, checkCriteriaFormat, checkSkillSetIds };
