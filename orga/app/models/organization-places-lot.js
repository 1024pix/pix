import Model, { attr } from '@ember-data/model';

export default class PlacesLot extends Model {
  @attr('number') count;
  @attr('date') activationDate;
  @attr('date') expirationDate;
  @attr('string') status;
}

export const STATUSES = {
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
  ACTIVE: 'ACTIVE',
};
