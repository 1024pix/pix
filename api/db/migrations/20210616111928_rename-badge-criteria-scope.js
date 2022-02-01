exports.up = async function (knex) {
  return knex('badge-criteria').update({ scope: 'SkillSet' }).where({ scope: 'SomePartnerCompetences' });
};

exports.down = function (knex) {
  return knex('badge-criteria').update({ scope: 'SomePartnerCompetences' }).where({ scope: 'SkillSet' });
};
