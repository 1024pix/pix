import * as bookshelfToDomainConverter from '../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { BookshelfMembership } from '../../../shared/infrastructure/orm-models/Membership.js';

const findByUserId = function ({ userId }) {
  return BookshelfMembership.where({ userId, disabledAt: null })
    .fetchAll({ withRelated: ['organization'] })
    .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
};

export { findByUserId };
