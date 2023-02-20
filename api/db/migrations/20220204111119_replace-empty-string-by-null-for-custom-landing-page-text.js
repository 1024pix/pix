export const up = async function (knex) {
  await knex('campaigns').where({ customLandingPageText: '' }).update({ customLandingPageText: null });
};

export const down = async function (knex) {
  await knex('campaigns').where({ customLandingPageText: null }).update({ customLandingPageText: '' });
};
