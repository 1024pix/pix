const Snapshot = require('../../domain/models/data/snapshot');

module.exports = {
  save(snapshotRawData) {
    return new Snapshot(snapshotRawData)
      .save()
      .then((snapshot) => {
        return snapshot.get('id');
      })
      .catch((err) => {
        throw err;
      });
  }
};
