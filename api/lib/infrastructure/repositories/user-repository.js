const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const BookshelfUser = require('../data/user');
const moment = require('moment');
const { AlreadyRegisteredEmailError, AlreadyRegisteredUsernameError, SchoolingRegistrationAlreadyLinkedToUserError, UserNotFoundError } = require('../../domain/errors');
const User = require('../../domain/models/User');
const UserDetailsForAdmin = require('../../domain/models/UserDetailsForAdmin');
const PixRole = require('../../domain/models/PixRole');
const Membership = require('../../domain/models/Membership');
const UserOrgaSettings = require('../../domain/models/UserOrgaSettings');
const CertificationCenter = require('../../domain/models/CertificationCenter');
const CertificationCenterMembership = require('../../domain/models/CertificationCenterMembership');
const Organization = require('../../domain/models/Organization');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

const PIX_MASTER_ROLE_ID = 1;

function _toUserDetailsForAdminDomain(BookshelfUser) {
  const rawUserDetailsForAdmin = BookshelfUser.toJSON();
  return new UserDetailsForAdmin({
    id: rawUserDetailsForAdmin.id,
    firstName: rawUserDetailsForAdmin.firstName,
    lastName: rawUserDetailsForAdmin.lastName,
    birthdate: rawUserDetailsForAdmin.birthdate,
    organizationId: rawUserDetailsForAdmin.organizationId,
    username: rawUserDetailsForAdmin.username,
    email: rawUserDetailsForAdmin.email,
    cgu: rawUserDetailsForAdmin.cgu,
    pixOrgaTermsOfServiceAccepted: rawUserDetailsForAdmin.pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted: rawUserDetailsForAdmin.pixCertifTermsOfServiceAccepted,
    isAuthenticatedFromGAR: !!rawUserDetailsForAdmin.samlId,
  });
}

function _toCertificationCenterMembershipsDomain(certificationCenterMembershipBookshelf) {
  return certificationCenterMembershipBookshelf.map((bookshelf) => {
    return new CertificationCenterMembership({
      id: bookshelf.get('id'),
      certificationCenter: new CertificationCenter({
        id: bookshelf.related('certificationCenter').get('id'),
        name: bookshelf.related('certificationCenter').get('name'),
      })
    });
  });
}

function _toMembershipsDomain(membershipsBookshelf) {
  return membershipsBookshelf.map((membershipBookshelf) => {
    return new Membership({
      id: membershipBookshelf.get('id'),
      organizationRole: membershipBookshelf.get('organizationRole'),
      organization: new Organization({
        id: membershipBookshelf.related('organization').get('id'),
        code: membershipBookshelf.related('organization').get('code'),
        name: membershipBookshelf.related('organization').get('name'),
        type: membershipBookshelf.related('organization').get('type'),
        isManagingStudents: Boolean(membershipBookshelf.related('organization').get('isManagingStudents')),
        canCollectProfiles: Boolean(membershipBookshelf.related('organization').get('canCollectProfiles')),
        externalId: membershipBookshelf.related('organization').get('externalId')
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

function _toPixRolesDomain(pixRolesBookshelf) {
  return pixRolesBookshelf.map((pixRoleBookshelf) => {
    return new PixRole({
      id: pixRoleBookshelf.get('id'),
      name: pixRoleBookshelf.get('name'),
    });
  });
}

function _toDomain(userBookshelf) {
  return new User({
    id: userBookshelf.get('id'),
    firstName: userBookshelf.get('firstName'),
    lastName: userBookshelf.get('lastName'),
    email: userBookshelf.get('email'),
    username: userBookshelf.get('username'),
    password: userBookshelf.get('password'),
    shouldChangePassword: Boolean(userBookshelf.get('shouldChangePassword')),
    cgu: Boolean(userBookshelf.get('cgu')),
    pixOrgaTermsOfServiceAccepted: Boolean(userBookshelf.get('pixOrgaTermsOfServiceAccepted')),
    pixCertifTermsOfServiceAccepted: Boolean(userBookshelf.get('pixCertifTermsOfServiceAccepted')),
    memberships: _toMembershipsDomain(userBookshelf.related('memberships')),
    certificationCenterMemberships: _toCertificationCenterMembershipsDomain(userBookshelf.related('certificationCenterMemberships')),
    pixRoles: _toPixRolesDomain(userBookshelf.related('pixRoles')),
    hasSeenAssessmentInstructions: Boolean(userBookshelf.get('hasSeenAssessmentInstructions')),
    userOrgaSettings: _toUserOrgaSettingsDomain(userBookshelf.related('userOrgaSettings'))
  });
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { firstName, lastName, email } = filter;

  if (firstName) {
    qb.whereRaw('LOWER("firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (lastName) {
    qb.whereRaw('LOWER("lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (email) {
    qb.whereRaw('email LIKE ?', `%${email.toLowerCase()}%`);
  }
}

function _adaptModelToDb(user) {
  return _.omit(user, [
    'id', 'campaignParticipations', 'pixRoles', 'memberships',
    'certificationCenterMemberships', 'pixScore', 'knowledgeElements',
    'scorecards', 'userOrgaSettings'
  ]);
}

module.exports = {

  // TODO use _toDomain()
  findByEmail(email) {
    return BookshelfUser
      .where({ email: email.toLowerCase() })
      .fetch({ require: true })
      .then((bookshelfUser) => {
        return bookshelfUser.toDomainEntity();
      })
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for email ${email}`);
        }
        throw err;
      });
  },

  getByUsernameOrEmailWithRoles(username) {
    return BookshelfUser
      .query((qb) => qb.where({ email: username.toLowerCase() }).orWhere({ 'username': username }))
      .fetch({
        withRelated: [
          { 'memberships': (qb) => qb.where({ disabledAt: null }) },
          'memberships.organization',
          'pixRoles',
          'certificationCenterMemberships.certificationCenter',
        ]
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError());
        }
        return _toDomain(foundUser);
      });
  },

  get(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({ require: true, withRelated: ['userOrgaSettings'] })
      .then((user) => bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user))
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  getUserDetailsForAdmin(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({ require: true, columns: ['id','firstName','lastName','email','username','cgu','pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted','samlId', ] })
      .then((userDetailsForAdmin) => _toUserDetailsForAdminDomain(userDetailsForAdmin))
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  findPaginatedFiltered({ filter, page }) {
    return BookshelfUser
      .query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: page.number,
        pageSize: page.size
      })
      .then(({ models, pagination }) => {
        const users = bookshelfToDomainConverter.buildDomainObjects(BookshelfUser, models);
        return { models: users, pagination };
      });
  },

  getWithMemberships(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        withRelated: [
          { 'memberships': (qb) => qb.where({ disabledAt: null }) },
          'memberships.organization',
        ]
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError(`User not found for ID ${userId}`));
        }
        return _toDomain(foundUser);
      });
  },

  getWithCertificationCenterMemberships(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        require: true,
        withRelated: [
          'certificationCenterMemberships.certificationCenter',
        ]
      })
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof BookshelfUser.NotFoundError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  },

  getWithOrgaSettings(userId) {
    return BookshelfUser
      .where({ id: userId })
      .fetch({
        withRelated: [
          'userOrgaSettings',
          'userOrgaSettings.currentOrganization',
        ]
      })
      .then((foundUser) => {
        if (foundUser === null) {
          return Promise.reject(new UserNotFoundError(`User not found for ID ${userId}`));
        }
        return _toDomain(foundUser);
      });
  },

  async getBySamlId(samlId) {
    const bookshelfUser = await BookshelfUser
      .where({ samlId })
      .fetch();
    return bookshelfUser ? _toDomain(bookshelfUser) : null;
  },

  create(user) {
    const userToCreate = _adaptModelToDb(user);
    return new BookshelfUser(userToCreate)
      .save()
      .then((bookshelfUser) => bookshelfUser.toDomainEntity());
  },

  isEmailAvailable(email) {
    return BookshelfUser
      .where({ email: email.toLowerCase() })
      .fetch()
      .then((user) => {
        if (user) {
          return Promise.reject(new AlreadyRegisteredEmailError());
        }

        return Promise.resolve(email);
      });
  },

  async isEmailAllowedToUseForCurrentUser(userId, email) {
    const userFound = await BookshelfUser
      .where('id', '!=', userId)
      .where({ email: email.toLowerCase() })
      .fetch();
    if (userFound) {
      throw new AlreadyRegisteredEmailError();
    }
    else {
      return true;
    }
  },

  isUserExistingByEmail(email) {
    return BookshelfUser
      .where({ email: email.toLowerCase() })
      .fetch({ require: true })
      .then(() => true)
      .catch(() => {
        throw new UserNotFoundError();
      });
  },

  updatePassword(id, hashedPassword) {
    return BookshelfUser
      .where({ id })
      .save({ password: hashedPassword }, { patch: true, method: 'update' })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  async updateUserDetailsForAdministration(id, userAttributes) {
    try {
      const updatedUser = await BookshelfUser
        .where({ id })
        .save(userAttributes, { patch: true, method: 'update' });
      return _toUserDetailsForAdminDomain(updatedUser);
    } catch (err) {
      if (err instanceof BookshelfUser.NoRowsUpdatedError) {
        throw new UserNotFoundError(`User not found for ID ${id}`);
      }
      throw err;
    }
  },

  async isPixMaster(id) {
    const user = await BookshelfUser
      .where({ 'users.id': id, 'users_pix_roles.user_id': id })
      .query((qb) => {
        qb.innerJoin('users_pix_roles', 'users_pix_roles.user_id', 'users.id');
        qb.where({ 'users_pix_roles.pix_role_id': PIX_MASTER_ROLE_ID });
      })
      .fetch({ columns: 'users.id' });
    return Boolean(user);
  },

  async updateHasSeenAssessmentInstructionsToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch();
    await user.save({ 'hasSeenAssessmentInstructions': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async acceptPixLastTermsOfService(id) {
    const user = await BookshelfUser.where({ id }).fetch();
    await user.save({
      'lastTermsOfServiceValidatedAt': moment().toDate(),
      'mustValidateTermsOfService': false
    }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updatePixOrgaTermsOfServiceAcceptedToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch();
    await user.save({ 'pixOrgaTermsOfServiceAccepted': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async updatePixCertifTermsOfServiceAcceptedToTrue(id) {
    const user = await BookshelfUser.where({ id }).fetch();
    await user.save({ 'pixCertifTermsOfServiceAccepted': true }, { patch: true, method: 'update' });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfUser, user);
  },

  async createAndAssociateUserToSchoolingRegistration({ domainUser, schoolingRegistrationId }) {
    const userToCreate = _adaptModelToDb(domainUser);

    const trx = await Bookshelf.knex.transaction();
    try {
      const [userId] = await trx('users').insert(userToCreate, 'id');

      const updatedSchoolingRegistrationsCount = await trx('schooling-registrations')
        .where('id', schoolingRegistrationId)
        .whereNull('userId')
        .update({ userId });

      if (updatedSchoolingRegistrationsCount !== 1) {
        throw new SchoolingRegistrationAlreadyLinkedToUserError(`L'inscription ${schoolingRegistrationId} est déjà rattachée à un compte utilisateur.`);
      }

      await trx.commit();
      return userId;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },

  async isUsernameAvailable(username) {
    const foundUser = await BookshelfUser
      .where({ username })
      .fetch();
    if (foundUser) {
      throw new AlreadyRegisteredUsernameError();
    }
    return username;
  },

  updatePasswordThatShouldBeChanged(id, hashedPassword) {
    return BookshelfUser
      .where({ id })
      .save({ password: hashedPassword, shouldChangePassword: true }, { patch: true, method: 'update' })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${id}`);
        }
        throw err;
      });
  },

  async updateExpiredPassword({ userId, hashedNewPassword }) {
    return BookshelfUser
      .where({ id: userId })
      .save({ password: hashedNewPassword, shouldChangePassword: false }, { patch: true, method: 'update' })
      .then((bookshelfUser) => bookshelfUser.toDomainEntity())
      .catch((err) => {
        if (err instanceof BookshelfUser.NoRowsUpdatedError) {
          throw new UserNotFoundError(`User not found for ID ${userId}`);
        }
        throw err;
      });
  }

};
