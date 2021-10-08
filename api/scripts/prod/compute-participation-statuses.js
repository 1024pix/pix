// Usage: node compute-participation-statuses.js
const { knex } = require('../../db/knex-database-connection');

let logEnable;

async function computeParticipantStatuses(log = true) {
  logEnable = log;
  _log('Update SHARED campaign participations (Assessment and Profiles collection)...');
  await _updateSharedCampaignParticipations();
  _log('Update TO_SHARE campaign participations (Assessment only)...');
  await _updateToShareAssessmentParticipations();
  _log('Update TO_SHARE campaign participations (Profiles collection only)...');
  await _updateToShareProfileCollectionParticipations();
}

function _updateSharedCampaignParticipations() {
  return knex('campaign-participations').where({ isShared: true }).update({ status: 'SHARED' });
}

function _updateToShareAssessmentParticipations() {
  return knex.raw(`
  UPDATE
    "campaign-participations"
  SET
    "status" = 'TO_SHARE'
  WHERE
    "campaign-participations"."id" = ANY (
      SELECT
        "participations"."id"
      FROM
        "campaign-participations" AS "participations"
        INNER JOIN "assessments" ON "assessments"."campaignParticipationId" = "participations"."id"
        LEFT JOIN "assessments" AS "newerAssessments" ON "newerAssessments"."campaignParticipationId" = "participations"."id"
          AND "assessments"."createdAt" < "newerAssessments"."createdAt"
      WHERE
        "participations"."isShared" = FALSE
        AND "newerAssessments" IS NULL
        AND "assessments"."state" = 'completed'
    )
  `);
}

function _updateToShareProfileCollectionParticipations() {
  return knex.raw(`
  UPDATE "campaign-participations"
  SET "status" = 'TO_SHARE'
  WHERE
    "campaign-participations"."id" = ANY (
      SELECT
        "participations"."id"
      FROM
        "campaign-participations" AS "participations"
        JOIN "campaigns" ON "campaigns"."id" = "participations"."campaignId"
      WHERE
        "participations"."isShared" = FALSE
        AND "campaigns"."type" = 'PROFILES_COLLECTION'
    )
  `);
}

module.exports = computeParticipantStatuses;

let exitCode;
const SUCCESS = 0;
const FAILURE = 1;

if (require.main === module) {
  computeParticipantStatuses().then(handleSuccess).catch(handleError).finally(exit);
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

function _log(...args) {
  if (logEnable) {
    console.log(...args);
  }
}
