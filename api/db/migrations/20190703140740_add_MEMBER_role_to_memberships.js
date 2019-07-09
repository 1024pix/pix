const TABLE_NAME = 'memberships';

exports.up = async function(knex) {
  await knex.raw(`
    WITH newroles AS (
      SELECT id, 
             CASE ROW_NUMBER() OVER (PARTITION BY "organizationId" ORDER BY id ASC) WHEN 1 THEN 'OWNER' ELSE 'MEMBER' END newrole 
      FROM ${TABLE_NAME}
    )
    UPDATE ${TABLE_NAME} 
    SET "organizationRole" = ( select newroles.newrole FROM newroles WHERE ${TABLE_NAME}.id = newroles.id );
  `);
};

// Rollback, make every membership an MEMBER
exports.down = function(knex) {
  return knex(TABLE_NAME)
    .update({
      organizationRole: 'MEMBER',
    });
};
