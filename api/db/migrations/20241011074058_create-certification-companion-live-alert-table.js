import { CertificationCompanionLiveAlertStatus } from '../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';

const TABLE_NAME = 'certification-companion-live-alerts';

/**
 * @param {import('knex').Knex} knex
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments().primary().notNullable();
    table.integer('assessmentId').notNullable().unsigned().references('assessments.id').index();
    table
      .string('status')
      .notNullable()
      .defaultTo(CertificationCompanionLiveAlertStatus.ONGOING)
      .comment(
        `Alert status, which can be ${CertificationCompanionLiveAlertStatus.ONGOING} when the alert is created and ${CertificationCompanionLiveAlertStatus.CLEARED} when the alert is processed by the invigilator`,
      );
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.comment(`Missing companion extension alerts raised during certification assessments.`);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
