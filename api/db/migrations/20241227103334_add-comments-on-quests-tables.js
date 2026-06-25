const up = async function (knex) {
  await knex.schema.alterTable('attestations', function (table) {
    table.comment(
      `Table containing the attestation that can be delivered to users after completing a quest.
      This table is linked to the profile-rewards table.
      The attestation id matches the value of rewardId.`,
    );
    table.string('templateName').comment('The name of the PDF template used to generate the PDF attestation.').alter();
    table.string('key').comment('The key used to identify the attestation.').alter();
  });

  await knex.schema.alterTable('quests', function (table) {
    table.comment(
      `Table containing the available quests.
      Each time a user answers a challenge, we check for each quest if the user is eligible and deserves to obtain the reward linked to the quest.`,
    );

    table
      .string('rewardType')
      .comment(
        'This column defines the table linked to the reward. The attestation table is one of the possible values.',
      )
      .alter();
    table
      .bigInteger('rewardId')
      .comment(
        'The id of the reward linked to the quest. For example, if the rewardType is “attestation”, the rewardId will be the id of the attestation.',
      )
      .alter();
    table
      .jsonb('eligibilityRequirements')
      .comment(
        'This column contains the requirements to be eligible for the quest. The requirements are stored in JSON format.',
      )
      .alter();
    table
      .jsonb('successRequirements')
      .comment(
        'This column contains the requirements to be successful in the quest. The requirements are stored in JSON format. For example the requirements can be a list of skill ids.',
      )
      .alter();
  });

  await knex.schema.alterTable('profile-rewards', function (table) {
    table.comment(
      `This table links a user and a reward. It is a polymorphic relationship.
            The “reward” table referred to is defined by the “rewardType” column.`,
    );

    table.bigInteger('userId').comment('The id of the user.').alter();
    table
      .string('rewardType')
      .comment('The table linked to the reward. The attestation table is one of the possible values.')
      .alter();
    table
      .bigInteger('rewardId')
      .comment(
        'The id of the reward linked to the user. For example, if the rewardType is “attestation”, the rewardId will be the id column of the attestation table.',
      )
      .alter();
  });

  await knex.schema.alterTable('organizations-profile-rewards', function (table) {
    table.comment(
      `This is the linking table between an attestation and an organization.
            In essence, attestations are not necessarily linked to an organization.
            However, users must be able to share their attestation with their prescriber.
            To comply with the RGPD, we insert a row when the user shares the result of his campaign.
            The prescriber is now able to consult the attestation obtained by the user.`,
    );

    table.bigInteger('organizationId').comment('The organization id.').alter();
    table.bigInteger('profileRewardId').comment('The profile-reward id.').alter();
  });
};

const down = async function (knex) {
  await knex.schema.alterTable('attestations', function (table) {
    table.comment(null);
    table.string('templateName').comment(null).alter();
    table.string('key').comment(null).alter();
  });

  await knex.schema.alterTable('quests', function (table) {
    table.comment(null);

    table.string('rewardType').comment(null).alter();
    table.bigInteger('rewardId').comment(null).alter();
    table.jsonb('eligibilityRequirements').comment(null).alter();
    table.jsonb('successRequirements').comment(null).alter();
  });

  await knex.schema.alterTable('profile-rewards', function (table) {
    table.comment(null);

    table.bigInteger('userId').comment(null).alter();
    table.string('rewardType').comment(null).alter();
    table.bigInteger('rewardId').comment(null).alter();
  });

  await knex.schema.alterTable('organizations-profile-rewards', function (table) {
    table.comment(null);

    table.bigInteger('organizationId').comment(null).alter();
    table.bigInteger('profileRewardId').comment(null).alter();
  });
};

export { down, up };
