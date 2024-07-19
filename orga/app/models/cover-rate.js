import Model, { attr } from '@ember-data/model';

export default class CoverRate extends Model {
  @attr({ defaultValue: () => {} }) forNetwork;
  @attr({ defaultValue: () => {} }) forOrganization;
}
