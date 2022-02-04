exports.up = async function (knex) {
  await knex('campaigns').where({ customLandingPageText: '' }).update({ customLandingPageText: null });
};

exports.down = async function (knex) {
  await knex('campaigns').where({ customLandingPageText: null }).update({ customLandingPageText: '' });
};
