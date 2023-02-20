const TABLE_NAME = 'issue-report-categories';

export const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('name').notNullable();
    t.boolean('isDeprecated').notNullable().defaultTo(false);
    t.boolean('isImpactful').notNullable().defaultTo(false);
    t.integer('issueReportCategoryId');
  });

  await knex.batchInsert(TABLE_NAME, [
    {
      name: 'OTHER',
      isDeprecated: true,
      isImpactful: true,
    },
    {
      name: 'CANDIDATE_INFORMATIONS_CHANGES',
      isDeprecated: false,
      isImpactful: false,
    },
    {
      name: 'SIGNATURE_ISSUE',
      isDeprecated: false,
      isImpactful: false,
    },
    {
      name: 'CONNECTION_OR_END_SCREEN',
      isDeprecated: false,
      isImpactful: false,
    },
    {
      name: 'IN_CHALLENGE',
      isDeprecated: false,
      isImpactful: false,
    },
    {
      name: 'FRAUD',
      isDeprecated: false,
      isImpactful: true,
    },
    {
      name: 'TECHNICAL_PROBLEM',
      isDeprecated: true,
      isImpactful: true,
    },
    {
      name: 'NON_BLOCKING_CANDIDATE_ISSUE',
      isDeprecated: false,
      isImpactful: false,
    },
    {
      name: 'NON_BLOCKING_TECHNICAL_ISSUE',
      isDeprecated: false,
      isImpactful: false,
    },
    {
      name: 'LATE_OR_LEAVING',
      isDeprecated: true,
      isImpactful: false,
    },
  ]);

  const categories = await knex('issue-report-categories').select('name', 'id');
  const getCategoryId = (lookupName) => categories.find(({ name }) => lookupName === name).id;
  await knex.batchInsert(TABLE_NAME, [
    {
      name: 'LEFT_EXAM_ROOM',
      isDeprecated: true,
      isImpactful: false,
      issueReportCategoryId: getCategoryId('OTHER'),
    },
    {
      name: 'NAME_OR_BIRTHDATE',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('CANDIDATE_INFORMATIONS_CHANGES'),
    },
    {
      name: 'EXTRA_TIME_PERCENTAGE',
      isDeprecated: false,
      isImpactful: false,
      issueReportCategoryId: getCategoryId('CANDIDATE_INFORMATIONS_CHANGES'),
    },
    {
      name: 'IMAGE_NOT_DISPLAYING',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'LINK_NOT_WORKING',
      isDeprecated: true,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'EMBED_NOT_WORKING',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'FILE_NOT_OPENING',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'WEBSITE_UNAVAILABLE',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'WEBSITE_BLOCKED',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'EXTRA_TIME_EXCEEDED',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'SOFTWARE_NOT_WORKING',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'UNINTENTIONAL_FOCUS_OUT',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'OTHER',
      isDeprecated: true,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('OTHER'),
    },
    {
      name: 'SKIP_ON_OOPS',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
    {
      name: 'ACCESSIBILITY_ISSUE',
      isDeprecated: false,
      isImpactful: true,
      issueReportCategoryId: getCategoryId('IN_CHALLENGE'),
    },
  ]);
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
