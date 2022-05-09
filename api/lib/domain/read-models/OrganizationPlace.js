const statuses = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
};

const categories = {
  T0: 'FREE_RATE',
  T1: 'PUBLIC_RATE',
  T2: 'REDUCE_RATE',
  T2bis: 'SPECIAL_REDUCE_RATE',
  T3: 'FULL_RATE',
};

class OrganizationPlace {
  constructor({ id, count, activationDate, expiredDate, reference, category, creatorFirstName, creatorLastName } = {}) {
    this.id = id;
    this.count = count;
    this.activationDate = activationDate;
    this.expiredDate = expiredDate;
    this.reference = reference;
    this.category = categories[category];
    this.creatorFullName = `${creatorFirstName} ${creatorLastName}`;
    this.status = _setStatus(activationDate, expiredDate);
  }
}

function _setStatus(activationDate, expiredDate) {
  const today = new Date();

  if (Boolean(expiredDate) && expiredDate < today) {
    return statuses.EXPIRED;
  }

  if (activationDate < today) {
    return statuses.ACTIVE;
  }

  return statuses.PENDING;
}

OrganizationPlace.statuses = statuses;
OrganizationPlace.categories = categories;

module.exports = OrganizationPlace;
