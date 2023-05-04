const up = async function (knex) {
  await knex('campaigns').where({ customLandingPageText: '' }).update({ customLandingPageText: null });
};

const down = async function (knex) {
  await knex('campaigns').where({ customLandingPageText: null }).update({ customLandingPageText: '' });
};

export { up, down };
