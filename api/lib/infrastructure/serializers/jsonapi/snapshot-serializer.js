const JSONAPISerializer = require('jsonapi-serializer').Serializer;

class SnapshotSerializer {
  serialize(snapshot) {
    return new JSONAPISerializer('snapshots', {
      attributes: ['id'],
      transform(snapshot) {
        snapshot.id = snapshot.id.toString();
        return snapshot;
      }
    }).serialize(snapshot);
  }
}

module.exports = new SnapshotSerializer();
