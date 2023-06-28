import * as categories from '../constants/organization-places-categories.js';

const statuses = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
};

const categoriesByCode = {
  [categories.T0]: categories.FREE_RATE,
  [categories.T1]: categories.PUBLIC_RATE,
  [categories.T2]: categories.REDUCE_RATE,
  [categories.T2bis]: categories.SPECIAL_REDUCE_RATE,
  [categories.T3]: categories.FULL_RATE,
};

class OrganizationPlacesLotManagement {
  constructor({
    id,
    count,
    activationDate,
    expirationDate,
    reference,
    category,
    creatorFirstName,
    creatorLastName,
  } = {}) {
    this.id = id;
    this.count = count;
    this.activationDate = activationDate;
    this.expirationDate = expirationDate;
    this.reference = reference;
    this.category = categoriesByCode[category];
    this.creatorFullName = `${creatorFirstName} ${creatorLastName}`;
    this.status = _setStatus(activationDate, expirationDate);
  }
}

function _setStatus(activationDate, expirationDate) {
  const today = new Date();

  if (Boolean(expirationDate) && expirationDate < today) {
    return statuses.EXPIRED;
  }

  if (activationDate < today) {
    return statuses.ACTIVE;
  }

  return statuses.PENDING;
}

OrganizationPlacesLotManagement.statuses = statuses;
OrganizationPlacesLotManagement.categories = categoriesByCode;

export { OrganizationPlacesLotManagement };
