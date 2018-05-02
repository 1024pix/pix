// Because Sqlite doesn't support alter column, we have to do the following :

exports.up = (knex) => {
  return knex.schema.table('snapshots', (t) => {
    t.renameColumn('studentCode', 'stdtCode');
    t.renameColumn('campaignCode', 'cmpnCode');
  }).then(() => {
    return knex.schema.table('snapshots', (t) => {
      t.string('studentCode');
      t.string('campaignCode');
    });
  }).then(() => {
    return knex('snapshots').update({
      studentCode: knex.raw(['stdtCode'])
    });
  }).then(() => {
    return knex('snapshots').update({
      campaignCode: knex.raw(['cmpnCode'])
    });
  }).then(() => {
    return knex.schema.table('snapshots', (t) => {
      t.dropColumn('stdtCode');
      t.dropColumn('cmpnCode');
    });
  });
};

exports.down = (knex) => {
  return knex.schema.table('snapshots', (t) => {
    t.renameColumn('studentCode', 'stdtCode');
    t.renameColumn('campaignCode', 'cmpnCode');
  }).then(() => {
    return knex.schema.table('snapshots', (t) => {
      t.string('studentCode', 20);
      t.string('campaignCode', 20);
    });
  }).then(() => {
    return knex('snapshots').update({
      studentCode: knex.raw(['stdtCode'])
    });
  }).then(() => {
    return knex('snapshots').update({
      campaignCode: knex.raw(['cmpnCode'])
    });
  }).then(() => {
    return knex.schema.table('snapshots', (t) => {
      t.dropColumn('stdtCode');
      t.dropColumn('cmpnCode');
    });
  });
};
