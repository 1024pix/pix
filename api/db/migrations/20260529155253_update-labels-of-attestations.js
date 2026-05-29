const TABLE_NAME = 'attestations';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex(TABLE_NAME).where({ id: 1 }).update({ label: 'Sensibilisation au numérique' });
  await knex(TABLE_NAME).where({ id: 2 }).update({ label: 'Sensibilisation au numérique (Parentalité)' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex(TABLE_NAME).where({ id: 1 }).update({ label: 'Attestation de sensibilisation au numérique' });
  await knex(TABLE_NAME)
    .where({ id: 2 })
    .update({ label: 'Attestation de sensibilisation au numérique (Parentalité)' });
};

export { down, up };
