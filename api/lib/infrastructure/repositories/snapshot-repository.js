const Snapshot = require('../data/snapshot');

module.exports = {
  save(snapshotRawData) {
    return new Snapshot(snapshotRawData).save();
  },

  getSnapshotsByOrganizationId(organizationId) {
    return Snapshot
      .where('organizationId', organizationId)
      .orderBy('-createdAt')
      .fetchAll();
  }
};
