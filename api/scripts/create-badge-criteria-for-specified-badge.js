import Joi from 'joi';
import bluebird from 'bluebird';
import { NotFoundError } from '../lib/domain/errors.js';
import { SCOPES } from '../lib/domain/models/BadgeDetails.js';
import * as badgeRepository from '../src/shared/infrastructure/repositories/badge-repository.js';
import * as badgeCriteriaRepository from '../lib/infrastructure/repositories/badge-criteria-repository.js';
import { DomainTransaction } from '../lib/infrastructure/DomainTransaction.js';
import { disconnect } from '../db/knex-database-connection.js';
import { readFile } from 'fs/promises';
import * as url from 'url';

// Usage: node scripts/create-badge-criteria-for-specified-badge path/data.json
// data.json
// {
//   "badgeId": 112,
//   "criteria": [
//     {
//       "threshold": 23,
//       "scope": "CampaignParticipation",
//     },
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
    scope: Joi.string().valid('CampaignParticipation'),
  });

  criteria.forEach((badgeCriterion) => {
    const { error } = badgeCriterionSchema.validate(badgeCriterion);
    if (error) {
      throw error;
    }
    if (badgeCriterion.scope !== SCOPES.CAMPAIGN_PARTICIPATION) {
      throw new Error('Unknown scope');
    }
  });
}

async function _createBadgeCriterion(badgeCriterion, domainTransaction) {
  return badgeCriteriaRepository.save({ badgeCriterion: { ...badgeCriterion } }, domainTransaction);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log('Starting creating badge criteria');

  const filePath = process.argv[2];

  console.log('Reading json data file... ');
  const jsonFile = await readFile(filePath);
  console.log('ok');

  await checkBadgeExistence(jsonFile.badgeId);
  console.log('Badge exists');

  checkCriteriaFormat(jsonFile.criteria);
  console.log('BadgeCriteria schema ok');

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

export { checkBadgeExistence, checkCriteriaFormat };
