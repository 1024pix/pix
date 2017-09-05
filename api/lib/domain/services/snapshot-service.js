const snapshotRepository = require('../../../lib/infrastructure/repositories/snapshot-repository');

module.exports = {
  create(snapshot) {
    const snapshotRaw = {
      organizationId: snapshot.organizationId,
      completionPercentage: snapshot.completionPercentage,
      userId: snapshot.profile.data.id,
      score: snapshot.profile.data.attributes['total-pix-score'],
      profile: JSON.stringify(snapshot.profile)
    };

    return snapshotRepository
      .save(snapshotRaw)
      .then((snapshot) => snapshot.get('id'));
  }
};
