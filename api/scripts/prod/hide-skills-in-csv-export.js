const { knex } = require('../../db/knex-database-connection');

async function hideSkills() {
  await knex('organizations').where('showSkills', true).update({ showSkills: false });
}

module.exports = {
  hideSkills,
};

if (require.main === module) {
  hideSkills()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
