const foreignKeys = [
  {
    table_name: 'finalized-sessions',
    column_name: 'sessionId',
  },
  {
    table_name: 'knowledge-element-snapshots',
    column_name: 'userId',
  },
];

module.exports = {
  foreignKeys,
};
