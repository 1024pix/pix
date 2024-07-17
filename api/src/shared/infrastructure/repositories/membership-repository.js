import { BookshelfMembership } from '../../../../lib/infrastructure/orm-models/Membership.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';

const findByUserId = function ({ userId }) {
  return BookshelfMembership.where({ userId, disabledAt: null })
    .fetchAll({ withRelated: ['organization'] })
    .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
};

const findByUserIdAndOrganizationId = function ({ userId, organizationId, includeOrganization = false }) {
  return BookshelfMembership.where({ userId, organizationId, disabledAt: null })
    .fetchAll({ withRelated: includeOrganization ? ['organization', 'organization.tags'] : [] })
    .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
};

export { findByUserId, findByUserIdAndOrganizationId };
