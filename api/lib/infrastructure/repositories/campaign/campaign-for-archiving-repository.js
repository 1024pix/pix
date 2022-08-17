const { knex } = require('../../../../db/knex-database-connection');
const Campaign = require('../../../domain/models/CampaignForArchiving');
const knexUtils = require('../../utils/knex-utils');

const { NotFoundError, UserNotFoundError } = require('../../../domain/errors');

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
  const row = await knex('campaigns').select(['code', 'archivedAt', 'archivedBy']).where({ code }).first();
  if (!row) {
    throw new NotFoundError();
  }
  return new Campaign(row);
}

module.exports = {
  save,
  getByCode,
};
