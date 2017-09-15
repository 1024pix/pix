const JSONAPISerializer = require('jsonapi-serializer').Serializer;

class SnapshotSerializer {
  serialize(snapshots) {
    return new JSONAPISerializer('snapshot', {
      attributes: ['score', 'createdAt', 'completionPercentage', 'user'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName']
      },
      transform(snapshot) {
        snapshot.id = snapshot.id.toString();
        snapshot.completionPercentage = snapshot.completionPercentage && snapshot.completionPercentage.toString() || null;
        snapshot.score = snapshot.score && snapshot.score.toString() || null;
        return snapshot;
      }
    }).serialize(snapshots);
  }
}

module.exports = new SnapshotSerializer();
