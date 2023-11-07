import { BookshelfMembership } from '../../../../lib/infrastructure/orm-models/Membership.js';
import * as bookshelfToDomainConverter from '../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';

const findByUserId = function ({ userId }) {
  return BookshelfMembership.where({ userId, disabledAt: null })
    .fetchAll({ withRelated: ['organization'] })
    .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
};

export { findByUserId };
