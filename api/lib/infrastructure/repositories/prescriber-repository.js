const BookshelfUser = require('../data/user');
const { UserNotFoundError } = require('../../domain/errors');
const Prescriber = require('../../domain/read-models/Prescriber');
const Membership = require('../../domain/models/Membership');
const UserOrgaSettings = require('../../domain/models/UserOrgaSettings');
const Organization = require('../../domain/models/Organization');

function _toPrescriberDomain(bookshelfUser) {
  const { id, firstName, lastName, pixOrgaTermsOfServiceAccepted } = bookshelfUser.toJSON();
  return new Prescriber({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    memberships: _toMembershipsDomain(bookshelfUser.related('memberships')),
    userOrgaSettings: _toUserOrgaSettingsDomain(bookshelfUser.related('userOrgaSettings'))
  });
}

function _toMembershipsDomain(membershipsBookshelf) {
  return membershipsBookshelf.map((membershipBookshelf) => {
    const { id, code, name, type, isManagingStudents, canCollectProfiles, externalId } = membershipBookshelf.related('organization').attributes;
    return new Membership({
      id: membershipBookshelf.get('id'),
      organizationRole: membershipBookshelf.get('organizationRole'),
      organization: new Organization({
        id,
        code,
        name,
        type,
        isManagingStudents,
        canCollectProfiles,
        externalId,
      }),
    });
  });
}

function _toUserOrgaSettingsDomain(userOrgaSettingsBookshelf) {
  const { id, code, name, type, isManagingStudents, canCollectProfiles, externalId } = userOrgaSettingsBookshelf.related('currentOrganization').attributes;
  return new UserOrgaSettings({
    id: userOrgaSettingsBookshelf.get('id'),
    currentOrganization: new Organization({
      id,
      code,
      name,
      type,
      isManagingStudents: Boolean(isManagingStudents),
      canCollectProfiles: Boolean(canCollectProfiles),
      externalId
    }),
  });
}

module.exports = {

  async getPrescriber(userId) {
    try {
      const prescriber = await BookshelfUser
        .where({ id: userId })
        .fetch({ require: true,
          columns: ['id','firstName','lastName', 'pixOrgaTermsOfServiceAccepted'],
          withRelated: [
            { 'memberships': (qb) => qb.where({ disabledAt: null }) },
            'memberships.organization',
            'userOrgaSettings',
            'userOrgaSettings.currentOrganization',
          ] });
      return _toPrescriberDomain(prescriber);
    } catch (err) {
      if (err instanceof BookshelfUser.NotFoundError) {
        throw new UserNotFoundError(`User not found for ID ${userId}`);
      }
      throw err;
    }
  },
};
