const Snapshot = require('../data/snapshot');

module.exports = {
  save(snapshotRawData) {
    return new Snapshot(snapshotRawData).save();
  },

  getSnapshotsByOrganizationId(organizationId) {
    return Snapshot
      .where({ organizationId })
      .orderBy('createdAt', 'desc')
      .fetchAll();
  },

  find(options) {
    return Snapshot
      .where({ organizationId: options.organizationId })
      .orderBy('createdAt', 'desc')
      .fetchPage({ page: options.page, pageSize: options.pageSize });
  },
};
