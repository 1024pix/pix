const TABLE_NAME_TARGET_PROFILES = 'target-profiles';
const TABLE_NAME_TARGET_PROFILES_SKILLS = 'target-profiles_skills';
const TABLE_NAME_CAMPAIGNS = 'campaigns';

const targetProfile = {
  name: 'PIC - Diagnostic Initial',
  isPublic: true,
  organizationId: null
};

const associatedSkills = [
  { skillId: 'rectL2ZZeWPc7yezp' },
  { skillId: 'recndXqXiv4pv2Ukp' },
  { skillId: 'recMOy4S8XnaWblYI' },
  { skillId: 'recagUd44RPEWti0X' },
  { skillId: 'recrvTvLTUXEcUIV1' },
  { skillId: 'recX7RyCsdNV2p168' },
  { skillId: 'recxtb5aLs6OAAKIg' },
  { skillId: 'receRbbt9Lb661wFB' },
  { skillId: 'rec71e3PSct2zLEMj' },
  { skillId: 'recFwJlpllhWzuLom' },
  { skillId: 'rec0J9OXaAj5v7w3r' },
  { skillId: 'reclY3njuk6EySJuU' },
  { skillId: 'rec5V9gp65a58nnco' },
  { skillId: 'recPrXhP0X07OdHXe' },
  { skillId: 'recPG9ftlGZLiF0O6' },
  { skillId: 'rectLj7NPg5JcSIqN' },
  { skillId: 'rec9qal2FLjWysrfu' },
  { skillId: 'rechRPFlSryfY3UnG' },
  { skillId: 'recL0AotZshb9quhR' },
  { skillId: 'recrOwaV2PTt1N0i5' },
  { skillId: 'recpdpemRXuzV9r10' },
  { skillId: 'recWXtN5cNP1JQUVx' },
  { skillId: 'recTIddrkopID28Ep' },
  { skillId: 'recBrDIfDDW2IPpZV' },
  { skillId: 'recgOc2OreHCosoRp' },
];

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME_TARGET_PROFILES, (t) => {
      t.increments().primary();
      t.string('name').notNullable();
      t.boolean('isPublic').notNullable().defaultTo(false);
      t.integer('organizationId').unsigned().references('organizations.id').index();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    })
    .then(() => {
      console.log(`${TABLE_NAME_TARGET_PROFILES} table is created!`);
    })
    .then(() => {
      return knex.schema
        .createTable(TABLE_NAME_TARGET_PROFILES_SKILLS, (t) => {
          t.increments().primary();
          t.integer('targetProfileId').unsigned().references('target-profiles.id').index();
          t.string('skillId').notNullable();
        });
    })
    .then(() => {
      console.log(`${TABLE_NAME_TARGET_PROFILES_SKILLS} table is created!`);
    })
    .then(() => {
      return knex(TABLE_NAME_TARGET_PROFILES)
        .insert(targetProfile)
        .returning('id');
    })
    .then((insertedTargetProfileId) => {
      const associatedSkillsWithTargetProfileId = associatedSkills.map((associatedSkill) => {
        associatedSkill.targetProfileId = insertedTargetProfileId[0];
        return associatedSkill;
      });
      return associatedSkillsWithTargetProfileId;
    })
    .then((associatedSkillsWithTargetProfileId) => {
      return knex(TABLE_NAME_TARGET_PROFILES_SKILLS)
        .insert(associatedSkillsWithTargetProfileId);
    })
    .then(() => {
      return knex.schema.table(TABLE_NAME_CAMPAIGNS, function(table) {
        table.integer('targetProfileId').references('target-profiles.id').index();
      });
    });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME_CAMPAIGNS, function(table) {
    table.dropColumn('targetProfileId');
  })
    .then(() => {
      return knex.schema.dropTable(TABLE_NAME_TARGET_PROFILES_SKILLS);
    })
    .then(() => {
      console.log(`${TABLE_NAME_TARGET_PROFILES_SKILLS} table was dropped!`);
    })
    .then(() => {
      return knex.schema.dropTable(TABLE_NAME_TARGET_PROFILES);
    })
    .then(() => {
      console.log(`${TABLE_NAME_TARGET_PROFILES} table was dropped!`);
    });
};
