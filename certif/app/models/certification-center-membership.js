import Model, { belongsTo } from '@ember-data/model';

export default class CertificationCenterMembership extends Model {
  @belongsTo('user') user;
  @belongsTo('certificationCenter') certificationCenter;
}
