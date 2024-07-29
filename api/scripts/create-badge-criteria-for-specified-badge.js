import { readFile } from 'node:fs/promises';
import * as url from 'node:url';

import bluebird from 'bluebird';
import Joi from 'joi';

import { disconnect } from '../db/knex-database-connection.js';
import { DomainTransaction } from '../lib/infrastructure/DomainTransaction.js';
import * as badgeCriteriaRepository from '../src/evaluation/infrastructure/repositories/badge-criteria-repository.js';
import * as badgeRepository from '../src/evaluation/infrastructure/repositories/badge-repository.js';
import { NotFoundError } from '../src/shared/domain/errors.js';
import { SCOPES } from '../src/shared/domain/models/BadgeDetails.js';

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

async function _createBadgeCriterion(badgeCriterion) {
  return badgeCriteriaRepository.save({ badgeCriterion: { ...badgeCriterion } });
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
  return DomainTransaction.execute(async () => {
    await bluebird.mapSeries(jsonFile.criteria, (badgeCriterion) => {
      return _createBadgeCriterion({ ...badgeCriterion, badgeId: jsonFile.badgeId });
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
