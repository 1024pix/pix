import * as categories from '../constants/organization-places-categories.js';
import { validate } from '../validators/organization-places-lot-validator.js';

const codeByCategories = {
  [categories.FREE_RATE]: categories.T0,
  [categories.PUBLIC_RATE]: categories.T1,
  [categories.REDUCE_RATE]: categories.T2,
  [categories.SPECIAL_REDUCE_RATE]: categories.T2bis,
  [categories.FULL_RATE]: categories.T3,
};
class OrganizationPlacesLotForManagement {
  constructor({ organizationId, count, activationDate, expirationDate, reference, category, createdBy } = {}) {
    this.organizationId = organizationId;
    this.count = count || null;
    this.activationDate = activationDate;
    this.expirationDate = expirationDate || null;
    this.reference = reference;
    this.category = codeByCategories[category];
    this.createdBy = createdBy;
    validate(this);
  }
}

OrganizationPlacesLotForManagement.categories = categories;

export { OrganizationPlacesLotForManagement };
