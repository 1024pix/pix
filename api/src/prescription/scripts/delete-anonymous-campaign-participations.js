/**
 * Deletes every anonymous participation of the given campaigns, and everything that hangs off it.
 *
 * A campaign with simplified access can be taken without an account: each journey creates an
 * anonymous user, an organization-learner, a campaign-participation, an assessment and its answers
 * with their knowledge-elements. Those accounts belong to nobody and cannot be recovered, so a
 * campaign that has served its purpose can be emptied of them entirely.
 *
 * None of the foreign keys involved is ON DELETE CASCADE: the rows have to be removed leaf-first,
 * in the order of DELETION_PLAN below.
 *
 * Usage — the campaign codes are always explicit, nothing is assumed:
 *   node src/prescription/scripts/delete-anonymous-campaign-participations.js --campaignCodes ABCDEF123
 *   … --campaignCodes ABCDEF123 --no-dryRun            # actually delete
 *   … --campaignCodes ABCDEF123,GHIJKL456
 *   … --campaignCodes ABCDEF123 --createdAfter 2026-07-21
 */
import chunk from 'lodash/chunk.js';

import { knex } from '../../../db/knex-database-connection.js';
import { commaSeparatedStringParser, isoDateParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';

const DEFAULT_BATCH_SIZE = 500;
const SKIPPED_USERS_LOGGED = 20;

const DELETION_PLAN = [
  // ── answers ──────────────────────────────────────────────────────────────────────────────────
  { table: 'certification-challenge-capacities', column: 'answerId', scope: 'assessmentIds', through: 'answers' },
  { table: 'flash-assessment-results', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'knowledge-elements', column: 'userId', scope: 'userIds' },
  { table: 'answers', column: 'assessmentId', scope: 'assessmentIds' },

  // ── assessments ──────────────────────────────────────────────────────────────────────────────
  { table: 'competence-marks', column: 'assessmentResultId', scope: 'assessmentIds', through: 'assessment-results' },
  {
    table: 'certification-courses-last-assessment-results',
    column: 'lastAssessmentResultId',
    scope: 'assessmentIds',
    through: 'assessment-results',
  },
  { table: 'assessment-results', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'certification-challenge-live-alerts', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'certification-companion-live-alerts', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'competence-evaluations', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'activities', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'feedbacks', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'chats', column: 'assessmentId', scope: 'assessmentIds' }, // no FK, matched on the column
  { table: 'mission-assessments', column: 'assessmentId', scope: 'assessmentIds' },
  { table: 'assessments', column: 'id', scope: 'assessmentIds' },

  // ── campaign participations ──────────────────────────────────────────────────────────────────
  { table: 'badge-acquisitions', column: 'campaignParticipationId', scope: 'campaignParticipationIds' },
  { table: 'knowledge-element-snapshots', column: 'campaignParticipationId', scope: 'campaignParticipationIds' },
  { table: 'pole-emploi-sendings', column: 'campaignParticipationId', scope: 'campaignParticipationIds' },
  { table: 'stage-acquisitions', column: 'campaignParticipationId', scope: 'campaignParticipationIds' },
  { table: 'user-recommended-trainings', column: 'campaignParticipationId', scope: 'campaignParticipationIds' },
  { table: 'campaign-participations', column: 'id', scope: 'campaignParticipationIds' },

  // ── organization learners ────────────────────────────────────────────────────────────────────
  { table: 'account-recovery-demands', column: 'organizationLearnerId', scope: 'organizationLearnerIds' },
  { table: 'organization-learner-features', column: 'organizationLearnerId', scope: 'organizationLearnerIds' },
  { table: 'organization_learner_participations', column: 'organizationLearnerId', scope: 'organizationLearnerIds' },
  { table: 'mission-assessments', column: 'organizationLearnerId', scope: 'organizationLearnerIds' },
  { table: 'organization-learners', column: 'id', scope: 'organizationLearnerIds' },

  // ── users ────────────────────────────────────────────────────────────────────────────────────
  { table: 'user-logins', column: 'userId', scope: 'userIds' },
  { table: 'last-user-application-connections', column: 'userId', scope: 'userIds' },
  { table: 'user-campaign-surveys', column: 'userId', scope: 'userIds' },
  { table: 'legal-document-version-user-acceptances', column: 'userId', scope: 'userIds' },
  { table: 'profile-rewards', column: 'userId', scope: 'userIds' },
  { table: 'tutorial-evaluations', column: 'userId', scope: 'userIds' }, // no FK, matched on the column
  { table: 'user-saved-tutorials', column: 'userId', scope: 'userIds' }, // idem
  { table: 'chats', column: 'userId', scope: 'userIds' }, // idem
  { table: 'badge-acquisitions', column: 'userId', scope: 'userIds' },
  { table: 'user-recommended-trainings', column: 'userId', scope: 'userIds' },
  { table: 'competence-evaluations', column: 'userId', scope: 'userIds' },
  { table: 'account-recovery-demands', column: 'userId', scope: 'userIds' },
  // No step on assessments.userId: assessmentIds already unions the assessments found by user and
  // by participation, so it would only count the same rows twice in the dry run.
  { table: 'users', column: 'id', scope: 'userIds' },
];

function buildQuery({ table, column, through }, ids) {
  const query = knex(table);

  // Both intermediate tables (answers, assessment-results) hang off assessments.
  if (through) {
    return query.whereIn(column, knex(through).select('id').whereIn('assessmentId', ids));
  }

  return query.whereIn(column, ids);
}

async function findCampaignIds(campaignCodes) {
  const campaigns = await knex('campaigns').select('id', 'code').whereIn('code', campaignCodes);
  const missing = campaignCodes.filter((code) => !campaigns.some((campaign) => campaign.code === code));

  if (missing.length > 0) {
    throw new Error(`Unknown campaign code(s): ${missing.join(', ')}`);
  }

  return campaigns.map(({ id }) => id);
}

/** Anonymous users that took part in the given campaigns — the root of everything deleted here. */
async function findTargetUserIds({ campaignIds, createdAfter, createdBefore }) {
  const query = knex('campaign-participations as participations')
    .join('users', 'users.id', 'participations.userId')
    .whereIn('participations.campaignId', campaignIds)
    .where('users.isAnonymous', true)
    .distinct('participations.userId as id');

  if (createdAfter) query.where('participations.createdAt', '>=', createdAfter);
  if (createdBefore) query.where('participations.createdAt', '<', createdBefore);

  return (await query).map(({ id }) => id);
}

async function findUserIdsWithOtherParticipations({ userIds, campaignIds, batchSize }) {
  const found = new Set();

  for (const ids of chunk(userIds, batchSize)) {
    const rows = await knex('campaign-participations')
      .distinct('userId')
      .whereIn('userId', ids)
      .whereNotIn('campaignId', campaignIds);
    rows.forEach(({ userId }) => found.add(userId));
  }

  return found;
}

async function collectIds({ table, column, matchColumn, ids, batchSize }) {
  const collected = [];

  for (const batch of chunk(ids, batchSize)) {
    const rows = await knex(table).distinct(`${column} as id`).whereIn(matchColumn, batch).whereNotNull(column);
    rows.forEach(({ id }) => collected.push(id));
  }

  return [...new Set(collected)];
}

async function buildScopes({ userIds, batchSize }) {
  const campaignParticipationIds = await collectIds({
    table: 'campaign-participations',
    column: 'id',
    matchColumn: 'userId',
    ids: userIds,
    batchSize,
  });

  const organizationLearnerIds = await collectIds({
    table: 'organization-learners',
    column: 'id',
    matchColumn: 'userId',
    ids: userIds,
    batchSize,
  });

  const assessmentIdsByUser = await collectIds({
    table: 'assessments',
    column: 'id',
    matchColumn: 'userId',
    ids: userIds,
    batchSize,
  });
  const assessmentIdsByParticipation = await collectIds({
    table: 'assessments',
    column: 'id',
    matchColumn: 'campaignParticipationId',
    ids: campaignParticipationIds,
    batchSize,
  });

  return {
    userIds,
    campaignParticipationIds,
    organizationLearnerIds,
    assessmentIds: [...new Set([...assessmentIdsByUser, ...assessmentIdsByParticipation])],
  };
}

async function countStep(step, scopes, batchSize) {
  let total = 0;

  for (const ids of chunk(scopes[step.scope], batchSize)) {
    const [{ count }] = await buildQuery(step, ids).count({ count: '*' });
    total += Number(count);
  }

  return total;
}

async function deleteStep(step, scopes, batchSize) {
  let total = 0;

  for (const ids of chunk(scopes[step.scope], batchSize)) {
    total += await buildQuery(step, ids).del();
  }

  return total;
}

/** Skipped users are worth naming, but a busy campaign can skip hundreds of them — cap the noise. */
function logSkipped(messages, logger) {
  messages.slice(0, SKIPPED_USERS_LOGGED).forEach((message) => logger.warn(message));

  if (messages.length > SKIPPED_USERS_LOGGED) {
    logger.warn(`… and ${messages.length - SKIPPED_USERS_LOGGED} more users skipped for the same reason`);
  }
}

export class DeleteAnonymousCampaignParticipationsScript extends Script {
  constructor() {
    super({
      description: 'Deletes the anonymous participations of the given campaigns, and everything that hangs off them',
      permanent: true,
      options: {
        campaignCodes: {
          type: 'string',
          describe: 'a list of comma separated campaign codes',
          demandOption: true,
          coerce: commaSeparatedStringParser(),
        },
        createdAfter: {
          type: 'string',
          describe: 'only participations created on or after this day (YYYY-MM-DD)',
          coerce: isoDateParser(),
        },
        createdBefore: {
          type: 'string',
          describe: 'only participations created strictly before this day (YYYY-MM-DD)',
          coerce: isoDateParser(),
        },
        dryRun: {
          type: 'boolean',
          describe: 'count the rows instead of deleting them',
          default: true,
        },
        batchSize: {
          type: 'number',
          describe: 'number of ids matched per statement',
          default: DEFAULT_BATCH_SIZE,
        },
      },
    });
  }

  /**
   * @returns {Promise<{ userIds: number[], skippedUserIds: number[], affectedRowCount: number }>}
   *   `affectedRowCount` is what a dry run would delete, or what an actual run did delete.
   */
  async handle({ options, logger }) {
    const { campaignCodes, createdAfter, createdBefore, dryRun = true, batchSize = DEFAULT_BATCH_SIZE } = options;

    const campaignIds = await findCampaignIds(campaignCodes);
    logger.info(`Campaigns ${campaignCodes.join(', ')} → ids ${campaignIds.join(', ')}`);

    const candidateUserIds = await findTargetUserIds({ campaignIds, createdAfter, createdBefore });
    logger.info(`${candidateUserIds.length} anonymous users participated in those campaigns`);

    if (candidateUserIds.length === 0) {
      logger.info('Nothing to delete.');
      return { userIds: [], skippedUserIds: [], affectedRowCount: 0 };
    }

    const withOtherParticipations = await findUserIdsWithOtherParticipations({
      userIds: candidateUserIds,
      campaignIds,
      batchSize,
    });
    logSkipped(
      [...withOtherParticipations].map(
        (userId) => `User ${userId} skipped: it participates in a campaign out of scope`,
      ),
      logger,
    );

    const userIds = candidateUserIds.filter((userId) => !withOtherParticipations.has(userId));
    const skippedUserIds = [...withOtherParticipations];
    logger.info(`${userIds.length} users kept in the deletion perimeter`);

    if (userIds.length === 0) {
      logger.info('Nothing to delete.');
      return { userIds, skippedUserIds, affectedRowCount: 0 };
    }

    const scopes = await buildScopes({ userIds, batchSize });
    logger.info(
      `Scope: ${scopes.userIds.length} users, ${scopes.organizationLearnerIds.length} organization-learners, ` +
        `${scopes.campaignParticipationIds.length} participations, ${scopes.assessmentIds.length} assessments`,
    );

    let total = 0;

    for (const step of DELETION_PLAN) {
      const affected = dryRun ? await countStep(step, scopes, batchSize) : await deleteStep(step, scopes, batchSize);
      total += affected;

      if (affected > 0) {
        logger.info(`${dryRun ? 'would delete' : 'deleted'} ${affected} rows from ${step.table} (${step.column})`);
      }
    }

    // A few tables are matched on two columns (badge-acquisitions, chats…), so a dry-run total can
    // count the same row twice; the deleted total never does.
    logger.info(`${dryRun ? 'Dry run: would delete up to' : 'Deleted'} ${total} rows in total`);

    if (dryRun) {
      logger.info('Re-run with --no-dryRun to apply.');
      return { userIds, skippedUserIds, affectedRowCount: total };
    }

    const remaining = await knex('users').whereIn('id', userIds).count({ count: '*' }).first();
    if (Number(remaining.count) > 0) {
      throw new Error(`${remaining.count} target users are still present — check the logs above`);
    }

    return { userIds, skippedUserIds, affectedRowCount: total };
  }
}

await ScriptRunner.execute(import.meta.url, DeleteAnonymousCampaignParticipationsScript);
