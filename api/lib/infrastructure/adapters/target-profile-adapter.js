const TargetProfile = require('../../domain/models/TargetProfile');
const skillAdapter = require('./skill-adapter');

module.exports = {

  fromDatasourceObjects({ bookshelfTargetProfile, associatedSkillAirtableDataObjects }) {

    const skills = associatedSkillAirtableDataObjects.map(skillAdapter.fromAirtableDataObject);
    let sharedWithOrganizationIds = [];

    if (bookshelfTargetProfile.related('sharedWithOrganizations')) {
      sharedWithOrganizationIds = bookshelfTargetProfile.related('sharedWithOrganizations')
        .map((organization) => organization.get('organizationId'));
    }
    return new TargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      organizationId: bookshelfTargetProfile.get('organizationId'),
      outdated: bookshelfTargetProfile.get('outdated'),
      skills,
      sharedWithOrganizationIds,
    });
  },
};
