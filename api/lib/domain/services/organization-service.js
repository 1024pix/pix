const { sampleSize, random } = require('lodash');

function _randomLetters(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return sampleSize(letters, count).join('');
}

module.exports = {

  generateOrganizationCode() {
    let code = _randomLetters(4);
    code += random(0, 9) + '' + random(0, 9);
    return code;
  },

  getOrganizationSharedProfilesAsCsv(dependencies, organizationId) {
    const { organizationRepository, competenceRepository, snapshotRepository, bookshelfUtils, snapshotsCsvConverter } = dependencies;

    let organization;
    let competences;
    let snapshots;

    const promises = [
      organizationRepository.get(organizationId),
      competenceRepository.find(),
      snapshotRepository.getSnapshotsByOrganizationId(organizationId)
    ];

    return Promise.all(promises)
      .then(([_organization, _competences, _snapshots]) => {
        organization = _organization;
        competences = _competences;
        snapshots = _snapshots;
      })
      .then(() => bookshelfUtils.mergeModelWithRelationship(snapshots, 'user'))
      .then(snapshotsWithRelatedUsers => snapshotsWithRelatedUsers.map((snapshot) => snapshot.toJSON()))
      .then(jsonSnapshots => snapshotsCsvConverter.convertJsonToCsv(organization, competences, jsonSnapshots));
  }
};
