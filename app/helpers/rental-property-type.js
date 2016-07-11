import Ember from 'ember';

const communityPropertyTypes = [
  'Condo',
  'Townhouse',
  'Apartment'
];

export function rentalPropertyType([type]/*, hash*/) {
  if (communityPropertyTypes.contains(type)) {
    return 'Community';
  }

  return 'Standalone';
}

export default Ember.Helper.helper(rentalPropertyType);
