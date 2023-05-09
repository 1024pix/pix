const up = async function(knex) {
  return knex('badge-criteria').update({ scope: 'SkillSet' }).where({ scope: 'SomePartnerCompetences' });
};

const down = function(knex) {
  return knex('badge-criteria').update({ scope: 'SomePartnerCompetences' }).where({ scope: 'SkillSet' });
};

export { up, down };
