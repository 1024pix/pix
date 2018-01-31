const snapshotRepository = require('../../../lib/infrastructure/repositories/snapshot-repository');

module.exports = {

  create(snapshot, user, serializedProfile) {
    const snapshotRaw = {
      organizationId: snapshot.organization.id,
      testsFinished: snapshot.testsFinished,
      studentCode: snapshot.studentCode,
      campaignCode: snapshot.campaignCode,
      userId: user.id,
      score: serializedProfile.data.attributes['total-pix-score'],
      profile: JSON.stringify(serializedProfile)
    };

    return snapshotRepository
      .save(snapshotRaw)
      .then((snapshot) => snapshot.get('id'));
  }
};
