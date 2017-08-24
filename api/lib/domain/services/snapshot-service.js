const snapshotRepository = require('../../../lib/infrastructure/repositories/snapshot-repository');

module.exports = {
  create(snapshot) {
    const snapshotRaw = {
      organizationId: snapshot.organizationId,
      userId: snapshot.profile.data.id,
      score: snapshot.profile.data.attributes['total-pix-score'],
      profile: JSON.stringify(snapshot.profile)
    };

    return snapshotRepository
      .save(snapshotRaw)
      .then((snapshot) => {
        return snapshot.get('id');
      });
    //.catch(err => err);

  }
};
