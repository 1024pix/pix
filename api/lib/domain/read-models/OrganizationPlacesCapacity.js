import lodash from 'lodash';

const { sumBy } = lodash;

import * as categories from '../constants/organization-places-categories.js';

const categoriesByCode = {
  [categories.T0]: categories.FREE_RATE,
  [categories.T1]: categories.PUBLIC_RATE,
  [categories.T2]: categories.REDUCE_RATE,
  [categories.T2bis]: categories.SPECIAL_REDUCE_RATE,
  [categories.T3]: categories.FULL_RATE,
};

class OrganizationPlacesCapacity {
  constructor({ placesLots, organizationId }) {
    this.id = `${organizationId}_places_capacity`;
    this.categories = [categories.T0, categories.T1, categories.T2, categories.T2bis, categories.T3].map((category) =>
      this.getPlacesCapacityForCategory(placesLots, category),
    );
  }

  getPlacesCapacityForCategory(placesLots, category) {
    const organizationPlacesLotsForCategory = placesLots.filter(
      ({ category: lotCategory }) => lotCategory === category,
    );

    return {
      category: categoriesByCode[category],
      count: sumBy(organizationPlacesLotsForCategory, 'count'),
    };
  }
}

export { OrganizationPlacesCapacity };
