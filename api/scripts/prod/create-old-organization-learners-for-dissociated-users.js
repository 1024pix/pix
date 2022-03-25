// Usage: node create-old-organization-learners-for-dissociated-users.js

const { knex } = require('../../db/knex-database-connection');
const bluebird = require('bluebird');
const DomainTransaction = require('../../lib/infrastructure/DomainTransaction');

let count;
let total;
let logEnable;

async function createOldOrganizationLearnersForDissociatedUsers(concurrency = 1, log = true) {
  logEnable = log;
  const campaignParticipations = await knex('campaign-participations as cp1')
    .select('cp1.id', 'users.id AS userId', 'users.firstName', 'users.lastName', 'campaigns.organizationId')
    .join('campaign-participations as cp2', function () {
      this.on({ 'cp1.campaignId': 'cp2.campaignId' }).andOn({
        'cp1.organizationLearnerId': 'cp2.organizationLearnerId',
      });
    })
    .join('users', 'users.id', 'cp1.userId')
    .join('campaigns', 'campaigns.id', 'cp1.campaignId')
    .where({ 'cp1.isImproved': false, 'cp2.isImproved': false })
    .where({ 'cp1.deletedAt': null, 'cp2.deletedAt': null })
    .whereRaw('cp1."createdAt" < cp2."createdAt"');

  count = 0;
  total = campaignParticipations.length;
  _log(`Participations à traiter : ${total}`);

  await bluebird.map(campaignParticipations, _createOldOrganizationLearnerForDissociatedUser, { concurrency });
}

async function _createOldOrganizationLearnerForDissociatedUser(participation) {
  await DomainTransaction.execute(async (domainTransaction) => {
    const [organizationLearnerId] = await domainTransaction
      .knexTransaction('organization-learners')
      .insert({
        firstName: participation.firstName,
        lastName: participation.lastName,
        userId: participation.userId,
        organizationId: participation.organizationId,
        isDisabled: true,
      })
      .returning('id');
    await _updateCampaignParticipationWithOrganizationLearnerId(
      participation,
      organizationLearnerId,
      domainTransaction
    );
  });

  count++;
  _log(`${count} / ${total}`);
}

function _updateCampaignParticipationWithOrganizationLearnerId(
  participation,
  organizationLearnerId,
  domainTransaction
) {
  return domainTransaction
    .knexTransaction('campaign-participations')
    .update({ organizationLearnerId })
    .where('id', participation.id);
}

module.exports = createOldOrganizationLearnersForDissociatedUsers;

let exitCode;
const SUCCESS = 0;
const FAILURE = 1;
const concurrency = parseInt(process.argv[2]);

if (require.main === module) {
  createOldOrganizationLearnersForDissociatedUsers(concurrency).then(handleSuccess).catch(handleError).finally(exit);
}

function handleSuccess() {
  exitCode = SUCCESS;
}

function handleError(err) {
  console.error(err);
  exitCode = FAILURE;
}

function exit() {
  console.log('code', exitCode);
  process.exit(exitCode);
}

function _log(message) {
  if (logEnable) {
    console.log(message);
  }
}
