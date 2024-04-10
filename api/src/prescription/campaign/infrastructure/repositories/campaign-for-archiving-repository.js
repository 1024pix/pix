import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError, UserNotFoundError } from '../../../../../lib/domain/errors.js';
import * as knexUtils from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignForArchiving } from '../../domain/models/CampaignForArchiving.js';

async function save(campaign) {
  try {
    await knex('campaigns').update(campaign).where({ code: campaign.code });
  } catch (error) {
    if (knexUtils.foreignKeyConstraintViolated(error)) {
      throw new UserNotFoundError('User Not Found');
    }
  }
}

async function getByCode(code) {
  const row = await knex('campaigns').select(['id', 'code', 'archivedAt', 'archivedBy']).where({ code }).first();
  if (!row) {
    throw new NotFoundError('Campaign Not Found');
  }
  return new CampaignForArchiving(row);
}

async function get(id) {
  const row = await knex('campaigns').select(['id', 'code', 'archivedAt', 'archivedBy']).where({ id }).first();
  if (!row) {
    throw new NotFoundError();
  }
  return new CampaignForArchiving(row);
}

export { get, getByCode, save };
